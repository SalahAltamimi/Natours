const Booking = require('../modules/bookModule');
const Tours = require('../modules/toursModule');
const Users = require('../modules/userModule');
const { catchAsync } = require('../utils/catchAsync');

exports.getoverview = catchAsync(async (req, res) => {
  const tours = await Tours.find();

  res.status(200).render('overview', {
    tours,
  });
});
exports.gettour = catchAsync(async (req, res) => {
  const tour = await Tours.findOne({ slugs: req.params.slug }).populate({
    path: 'review',
  });

  res.status(200).render('tour', {
    tour,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  res.status(200).render('login');
});

exports.getCurrent = (req, res) => {
  res.status(200).render('account', {
    title: 'My account',
  });
};
exports.updateDate = catchAsync(async (req, res) => {
  console.log(req.body);
  const user = await Users.findByIdAndUpdate(
    req.user.id,
    {
      email: req.body.email,
      name: req.body.name,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    user,
  });
});

exports.mybooking = catchAsync(async (req, res, next) => {
  const book = await Booking.find({ user: req.user.id });
  const tourId = book.map((el) => el.tour);
  console.log(tourId);
  const tours = await Tours.find({ _id: { $in: tourId } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});
