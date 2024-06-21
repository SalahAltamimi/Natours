const express = require('express');
const {
  getAllusers,
  getuser,
  updateuser,
  deleteuser,
  getCurrent,
  getMe,
} = require('../controllers/usercontoll');
const {
  signup,
  login,
  protect,
  restricTO,
  forgetpassword,
  resetpassword,
  updateMyPassword,
  updateMe,
  deleteMe,
  logout,
  updateSetting,
  resizeImage,
} = require('../controllers/Authcontroll');
const router = express.Router();
router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/forgetpassword').post(forgetpassword);
router.route('/restpassword/:token').patch(resetpassword);
router.use(protect);
router.route('/updateMyPassword').patch(updateMyPassword);
router.route('/updateMe').patch(updateSetting, resizeImage, updateMe);
router.route('/deleteMe').patch(deleteMe);
router.route('/me').get(getMe, getCurrent);
router.route('/').get(restricTO('admin', 'guide', 'user'), getAllusers);
router
  .route('/:id')
  .get(restricTO('admin', 'guide', 'user'), getuser)
  .patch(updateuser)
  .delete(deleteuser);
module.exports = router;
