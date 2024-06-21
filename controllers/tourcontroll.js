const Tours = require('../modules/toursModule');
const { catchAsync } = require('../utils/catchAsync');
const {
  getAll,
  creatOne,
  getOne,
  updateOne,
  deleteOne,
} = require('./handelFactory');

exports.getAlltours = getAll(Tours);
exports.createTour = creatOne(Tours);
exports.getTour = getOne(Tours, { path: 'review' });
exports.updateTour = updateOne(Tours);
exports.deleteTour = deleteOne(Tours);

exports.getWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  const doc = await Tours.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lng * 1, lat * 1], radius] },
    },
  });

  res.status(200).json({
    status: 'success',
    result: doc.length,
    data: doc,
  });
});
exports.geo = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  const doc = await Tours.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    { $project: { name: 1, distance: 1 } },
  ]);
  res.status(200).json({
    status: 'success',
    result: doc.length,
    data: doc,
  });
});
exports.getTop = catchAsync(async (req, res, next) => {
  const doc = await Tours.aggregate([
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        avg: { $avg: '$price' },
        sum: { $sum: 1 },
      },
    },
    { $addFields: { name: '$_id' } },
    { $project: { _id: 0 } },
  ]);
  res.status(200).json({
    status: 'success',
    result: doc.length,
    data: doc,
  });
});
