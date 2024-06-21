const mongoose = require('mongoose');
const { default: slugify } = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    startLocation: {
      description: {
        type: String,
        trim: true,
      },
      type: { type: String, trim: true, enum: ['Point'] },
      coordinates: [Number],
      address: { type: String, trim: true },
    },
    type: { type: String, trim: true, enum: ['Point'] },

    ratingsAverage: {
      type: Number,
      max: [5, 'please enter the value <= 5'],
      min: 1,
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: Number,
    images: [String],
    startDates: [Date],
    name: {
      type: String,
      required: [true, 'please enter the name'],
      unique: true,
      maxlength: 40,
      trim: true,
    },
    duration: Number,
    maxGroupSize: Number,
    difficulty: {
      type: String,
      trim: true,
      enum: {
        values: ['medium', 'difficult', 'easy'],
        message: 'the {VALUE} is not defin',
      },
    },
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    price: Number,
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'the {VALUE} is very high',
      },
    },
    summary: String,
    description: String,
    imageCover: String,
    locations: [
      {
        coordinates: [Number],
        day: Number,
        description: String,
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
      },
    ],
    slugs: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('review', {
  ref: 'Reviews',
  foreignField: 'tour',
  localField: '_id',
});

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.pre('save', function (next) {
  this.slugs = slugify(this.name);
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate('guides');
  next();
});

const Tours = mongoose.model('Tours', tourSchema);

module.exports = Tours;
