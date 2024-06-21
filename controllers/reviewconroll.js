const Reviews = require('../modules/reviewModule');
const {
  getAll,
  getOne,
  updateOne,
  deleteOne,
  creatOne,
} = require('./handelFactory');

exports.getAllreviews = getAll(Reviews);
exports.getreview = getOne(Reviews);
exports.updatereview = updateOne(Reviews);
exports.deletereview = deleteOne(Reviews);
exports.createreview = creatOne(Reviews);
exports.createreview2 = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourid;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};
