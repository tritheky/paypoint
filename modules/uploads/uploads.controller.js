const express = require('express');
const router = express.Router();
const uploadsService = require('./uploads.service');

// routes
router.post('/bookings', uploadBookings);
router.post('/users', uploadUsers);

module.exports = router;

function uploadBookings(req, res, next) {
  uploadsService
    .uploadBookings(req.file)
    .then((data) => res.json(data))
    .catch(next);
}

function uploadUsers(req, res, next) {
  uploadsService
    .uploadUsers(req.file)
    .then((data) => res.json(data))
    .catch(next);
}
