const path = require('path');
const express = require('express');
const morgan = require('morgan');
// const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARE
// Implement CORS
app.use(cors());
// Access-Control-Allow-Origin
// if you want to only allow one domain for ex: api.natours.com only connected to front-end natours.com
/*  
app.use(cors({
  origin: 'https://www.natours.com',
}))
*/
app.options('*', cors()); // * means All options: PUT, PATCH, DELETE

// Serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));
// console.log(process.env.NODE_ENV);

// Set security HTTP headers
// app.use(helmet());

app.use(helmet({ contentSecurityPolicy: false }));

// Development logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

//Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

// app.use(bodyParser.json());

app.use('/api', limiter);

// Stripe webhook, using express.raw()
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout,
);
// Stripe webhook, BEFORE body-parser, because stripe needs the body as stream
// app.post(
//   '/webhook-checkout',
//   bodyParser.raw({ type: 'application/json' }),
//   bookingController.webhookCheckout,
// );

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// parse data from url client side(form)
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

app.use(compression());

// Test Middleware
// app.use((req, res, next) => {
//   console.log('Hello from the middleware');
//   next(); //Always call next function for custom middleware
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
