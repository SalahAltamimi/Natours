const express = require('express');
const {
  getAlltours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getWithin,
  geo,
  getTop,
} = require('../controllers/tourcontroll');

const reviewrouter = require('./reviewrouter');
const router = express.Router();
router.use('/:tourid/reviews', reviewrouter);

router.route('/').get(getAlltours).post(createTour);
router.route('/top-5-cheab').get(getTop);
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getWithin);
router.route('/distances/:latlng/unit/:unit').get(geo);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
