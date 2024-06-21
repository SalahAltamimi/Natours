const express = require('express');
const {
  getAllreviews,
  getreview,
  updatereview,
  deletereview,
  createreview,
  createreview2,
} = require('../controllers/reviewconroll');
const { protect } = require('../controllers/Authcontroll');

const router = express.Router({ mergeParams: true });

router.use(protect);

router.route('/').get(getAllreviews).post(createreview2, createreview);
router.route('/:id').get(getreview).patch(updatereview).delete(deletereview);

module.exports = router;
