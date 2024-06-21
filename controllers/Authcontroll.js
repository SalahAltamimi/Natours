const Users = require('../modules/userModule');
const { AppError } = require('../utils/AppError');
const { catchAsync } = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const { sendemails } = require('../utils/emails');
const multer = require('multer');
const sharp = require('sharp');
const Email = require('../utils/emails');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerfilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('No an image', 404), false);
  }
};

exports.resizeImage = (req, res, next) => {
  console.log(req.file);
  if (!req.file) return next();
  const x = `user-${req.user.id}-${Date.now()}.jpeg`;
  req.file.filename = x;
  sharp(req.file.buffer)
    .resize(500, 500, {
      fit: sharp.fit.cover,
      // position: sharp.strategy.entropy,
    })
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${x}`);
  next();
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerfilter,
});

exports.updateSetting = upload.single('photo');
const createToken = (user, res, req) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_F, {
    expiresIn: '90d',
  });
  res.cookie('jwt', token, {
    httpOnly: true,
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    secure: req.secure === 'https',
  });

  user.password = undefined;

  res.status(200).json({
    status: 'success',
    token,
    user,
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const user = await Users.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/me`;
  new Email(user, url).sendWelcom();
  createToken(user, res, req);
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await Users.findOne({ email: email }).select('+password');
  if (!user) {
    return next(new AppError('We can not find the user', 404));
  }

  if (!(await user.checkpass(password, user.password))) {
    return next(new AppError('the password is wrong', 404));
  }
  createToken(user, res, req);
});
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('you are not login please login', 404));
  }

  const x = await promisify(jwt.verify)(token, process.env.JWT_F);
  const user = await Users.findById(x.id);

  if (!user) {
    return next(new AppError('the user is not exist', 404));
  }
  if (await user.checkpassdate(x.iat)) {
    return next(new AppError('the password changed', 404));
  }
  req.user = user;
  res.locals.user = user;
  next();
});
exports.isLogin = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      const x = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_F);
      const user = await Users.findById(x.id);

      if (!user) {
        return next();
      }
      if (await user.checkpassdate(x.iat)) {
        return next();
      }
      res.locals.user = user;
      return next();
    }
  } catch {
    return next();
  }
  next();
};
exports.restricTO = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('you did not have access', 404));
    }
    next();
  };
};

exports.forgetpassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await Users.findOne({ email: email });

  if (!user) {
    return next(new AppError('the user is not exist', 404));
  }
  const resetTokens = await user.resetToken();
  const url = `${req.protocol}://${req.get(
    'host'
  )}/resetpassword/${resetTokens}`;

  // const message = `if you forget the password click here ${url}`;
  try {
    // await sendemails({
    //   email: user.email,
    //   subject: 'forget the password the url expier after 10',
    //   message,
    // });
    console.log(url);

    await new Email(user, url).sendReset();
    await user.save({ validateBeforeSave: false });
    res.status(200).json({
      status: 'success',
      message: 'email sent',
    });
  } catch (err) {
    user.passwordToken = undefined;
    user.passwordTokenDate = undefined;
    await user.save({ validateBeforeSave: false });
    next(new AppError(err.message), 404);
  }
});
exports.resetpassword = catchAsync(async (req, res, next) => {
  const resetToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await Users.findOne({
    passwordToken: resetToken,
    passwordTokenDate: { $gt: Date.now() },
  });
  console.log(user);
  if (!user) {
    return next(new AppError('the url expire'), 404);
  }

  user.passwordToken = undefined;
  user.passwordTokenDate = undefined;
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createToken(user, res, req);
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  const user = await Users.findById(req.user._id).select('+password');
  if (!(await user.checkpass(req.body.currenpassword, user.password))) {
    return next(new AppError('the current password wrong'), 404);
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createToken(user, res, req);
});

const filterO = (body, ...allow) => {
  let input = {};
  Object.keys(body).forEach((el) => {
    if (allow.includes(el)) input[el] = body[el];
  });
  return input;
};
exports.updateMe = catchAsync(async (req, res, next) => {
  const filter = filterO(req.body, 'name', 'email');
  if (req.file) filter.photo = req.file.filename;
  const user = await Users.findByIdAndUpdate(req.user._id, filter, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    user,
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await Users.findByIdAndUpdate(req.user._id, { active: false });

  res.status(200).json({
    status: 'success',
    data: null,
  });
});

exports.logout = async (req, res) => {
  res.cookie('jwt', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now() + 10 * 1000),
  });
  res.set('Cache-Control', 'no-store, max-age=0');

  res.status(200).json({
    status: 'success',
  });
};
