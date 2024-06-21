const mongoose = require('mongoose');
const Tours = require('./toursModule');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      max: 5,
      min: 1,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tours',
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.Avgrating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        avg: { $avg: '$rating' },
        num: { $sum: 1 },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tours.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avg,
      ratingsQuantity: stats[0].num,
    });
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.Avgrating(this.tour);
});
reviewSchema.post(/^findOneAnd/, async function (doc, next) {
  await doc.constructor.Avgrating(doc.tour);
});
const Reviews = mongoose.model('Reviews', reviewSchema);

module.exports = Reviews;
