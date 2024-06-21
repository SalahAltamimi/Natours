const express = require('express');
const {
  getoverview,
  gettour,
  login,
  getCurrent,
  updateDate,
  mybooking,
} = require('../controllers/viewconroll');
const { isLogin, protect } = require('../controllers/Authcontroll');
// const { createCheckoutBooking } = require('../controllers/bookconroller');
const router = express.Router();
router.route('/me').get(protect, getCurrent);
router.route('/mybooking').get(protect, mybooking);
router.route('/submit-updatedata').post(protect, updateDate);

router.route('/').get(isLogin, getoverview);
router.route('/login').get(isLogin, login);
router.route('/tour/:slug').get(isLogin, gettour);

module.exports = router;
