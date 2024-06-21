const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxlength: 40,
  },

  email: {
    type: String,
    unique: true,
    validate: [validator.isEmail, 'please enter the correct email'],
    trim: true,
    lowercase: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'guide', 'lead-guide'],
    trim: true,
    default: 'user',
  },
  active: {
    type: Boolean,
    default: true,
  },
  photo: String,
  password: {
    type: String,
    select: false,
    trim: true,
    required: [true, 'please enter the password'],
  },
  passwordConfirm: {
    type: String,
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'the password is not match',
    },
  },
  passwordChangeAt: Date,
  passwordToken: String,
  passwordTokenDate: Date,
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangeAt = Date.now() - 1000;
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcryptjs.hash(this.password, 10);
  this.passwordConfirm = undefined;

  next();
});
userSchema.methods.checkpass = async function (password, userpassword) {
  return await bcryptjs.compare(password, userpassword);
};

userSchema.methods.checkpassdate = function (JWTI) {
  if (this.passwordChangeAt) {
    const change = parseInt(this.passwordChangeAt / 1000, 10);
    return JWTI < change;
  }
  return false;
};

userSchema.methods.resetToken = function () {
  const resetTokens = crypto.randomBytes(32).toString('hex');
  this.passwordToken = crypto
    .createHash('sha256')
    .update(resetTokens)
    .digest('hex');
  this.passwordTokenDate = Date.now() + 10 * 60 * 1000;
  return resetTokens;
};

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

const Users = mongoose.model('User', userSchema);

module.exports = Users;
