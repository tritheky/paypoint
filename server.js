require('rootpath')();
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('helpers/jwt');
const errorHandler = require('helpers/error-handler');
const excelUploadMiddleware = require('helpers/excel-upload-middleware');
const database = require('modules/database');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({ origin: '*', methods: 'POST' }));

app.use(jwt());
// api routes
app.use('/users', require('./modules/users/users.controller'));
app.use('/rewards', require('./modules/rewards/rewards.controller'));
app.use('/bookings', require('./modules/bookings/bookings.controller'));
app.use(
  '/uploads',
  excelUploadMiddleware.single('file'),
  require('./modules/uploads/uploads.controller'),
);
app.use(
  '/transactions',
  require('./modules/transactions/transactions.controller'),
);
app.use('/sms', require('./modules/sms/sms.controller'));
// global error handler
app.use(errorHandler);

// start server
const port = process.env.NODE_ENV === 'production' ? 80 : 3000;
const server = app.listen(port, function () {
  console.log('Server listening on port ' + port);
  database.init();
});
