const { ApiFeatures } = require('../utils/ApiFeatures');
const { AppError } = require('../utils/AppError');
const { catchAsync } = require('../utils/catchAsync');

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};

    if (req.params.tourid) filter = { tour: req.params.tourid };
    console.log(filter);
    const querys1 = new ApiFeatures(Model.find(filter), req.query)
      .filters()
      .sort()
      .fileds()
      .page();

    const doc = await querys1.Model;

    res.status(200).json({
      status: 'success',
      result: doc.length,
      data: {
        doc,
      },
    });
  });

exports.creatOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('no doc for this id', 404));
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('no doc for this id', 404));
    }

    res.status(200).json({
      status: 'success',
      data: null,
    });
  });
exports.getOne = (Model, populateOption) =>
  catchAsync(async (req, res, next) => {
    let tour = Model.findById(req.params.id);
    if (populateOption) tour = tour.populate(populateOption);
    const doc = await tour;
    if (!doc) {
      return next(new AppError('no doc for this id', 404));
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });
