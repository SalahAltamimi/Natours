const { catchAsync } = require('../utils/catchAsync');
const Tours = require('../modules/toursModule');
const Booking = require('../modules/bookModule');
const {
  getAll,
  creatOne,
  updateOne,
  deleteOne,
  getOne,
} = require('./handelFactory');
const Users = require('../modules/userModule');
const dotenv = require('dotenv').config({ path: 'config.env' });
const stripe = require('stripe')(process.env.STRIPE);

exports.CheckOuts = catchAsync(async (req, res, next) => {
  const tour = await Tours.findById(req.params.tourId);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slugs}`,
    customer_email: req.user.email,
    client_reference_id: req.user.id,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          unit_amount: tour.price * 100,
          currency: 'usd',
          product_data: {
            name: tour.name,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${
                tour.imageCover
              }`,
            ],
          },
        },
        quantity: 1,
      },
    ],
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

// exports.createCheckoutBooking = catchAsync(async (req, res, next) => {
//   console.log(req.query, req.originalUrl);
//   const { tour, user, price } = req.query;
//   if (!tour && !user && !price) return next();

//   await Booking.create({ tour, user, price });

//   res.redirect(req.originalUrl.split('?')[0]);
// });
const createBookingCheckout = async (session) => {
  console.log(session);
  const tour = await Tours.findOne({ name: session.display_items[0].name }).id;
  const user = (await Users.findOne({ email: session.customer_email })).id;
  const price = session.display_items[0].amount / 100;
  await Booking.create({ tour, user, price });
};

exports.webhookCheckout = catchAsync(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_Webhook
    );
  } catch (err) {
    res.status(400).send(`Webhook Errors: ${err.message}`);
    return;
  }

  console.log(`Unhandled event type ${event.type}`);

  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object);

  res.status(200).json({ received: true });
});

exports.getAllbooking = getAll(Booking);
exports.createBook = creatOne(Booking);
exports.updateBook = updateOne(Booking);
exports.deleteBook = deleteOne(Booking);
exports.getBook = getOne(Booking);
