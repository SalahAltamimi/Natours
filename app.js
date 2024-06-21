const express = require('express');
const helmet = require('helmet');
const hpp = require('hpp');
const sanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const limit = require('express-rate-limit');
const app = express();
const morgan = require('morgan');
const compression = require('compression');
const cookieparser = require('cookie-parser');
const cors = require('cors');
////////////
const { AppError } = require('./utils/AppError');
const tourrouter = require('./routers/tourrouter');
const userrouter = require('./routers/userrouter');
const reviewrouter = require('./routers/reviewrouter');
const path = require('path');
const viewrouter = require('./routers/viewrouter');
const router = require('./routers/bookrouter');
const { webhookCheckout } = require('./controllers/bookconroller');
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
// set status  & information tour
app.use(morgan('dev'));

app.post(
  '/webhooke',
  express.raw({ type: 'application/json' }),
  webhookCheckout
);
app.use(express.json());
app.use(cookieparser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
const limiter = limit({
  max: 100,
  windowMs: 3 * 60 * 1000,
  message: 'please try again after 3 min',
});
app.set('trust proxy', 1);
app.use(limiter);

// set http
app.use(helmet());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://js.stripe.com', 'https://unpkg.com'],
      // styleSrc: ["'self'", 'https://fonts.googleapis.com', 'https://unpkg.com'],
      connectSrc: ["'self'", 'ws://127.0.0.1:59418', 'ws://127.0.1.1:59418'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      frameSrc: ["'self'", 'https://js.stripe.com'],
      imgSrc: [
        "'self'",
        'data:',
        'https://tile.openstreetmap.org',
        'https://unpkg.com',
      ], // السماح بتحميل الصور من tile.openstreetmap.org
    },
  })
);

// app.use(helmet());
// app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(cors());

// app.use(
//   cors({
//     origin: '/api/v1/tours',
//   })
// );

app.options('*', cors());

// remove dublicate qurey for protect
app.use(hpp());

// لضغط البينات وتحسين السرعة
app.use(compression());
// convert . $
app.use(sanitize());

// convert html to json
app.use(xss());

// request limit

app.use('/', viewrouter);
app.use('/api/v1/tours', tourrouter);
app.use('/api/v1/users', userrouter);
app.use('/api/v1/review', reviewrouter);
app.use('/api/v1/booking', router);

app.all('*', (req, res, next) => {
  next(new AppError(`we can not find ${req.originalUrl}`, 404));
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  if (req.originalUrl.startsWith('/api')) {
    res.status(statusCode).json({
      status: status,
      message: err.message,
      stack: err.stack,
    });
  } else {
    res.status(statusCode).render('error', {
      tilte: 'Page error',
      msg: err.message,
    });
  }
});

module.exports = app;
