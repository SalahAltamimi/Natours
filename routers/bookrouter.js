const express = require('express');
const {
  CheckOuts,
  getAllbooking,
  deleteBook,
  getBook,
  createBook,
  updateBook,
} = require('../controllers/bookconroller');
const { protect, restricTO } = require('../controllers/Authcontroll');
const router = express.Router();

router.use(protect);
router.route('/checkout-session/:tourId').get(CheckOuts);

router.use(restricTO('admin'));
router.route('/').get(getAllbooking).post(createBook);
router.route('/:id').get(getBook).patch(updateBook).delete(deleteBook);
module.exports = router;
