const express = require('express');
const router = express.Router();
const bookingsService = require('./bookings.service');

// routes
router.get('/', getAllByUser);
router.get('/summary', getAllSummary);
router.post('/finish', updateFinished);
router.post('/nextTurn', nextTurnBooking);

module.exports = router;

function getAllSummary(req, res, next) {
  if (!req.user.admin) {
    throw 'Không có quyền truy cập';
  }
  bookingsService
    .getAllSummary(req.query.q, req.query.page, req.query.page_size)
    .then((data) => res.json(data))
    .catch(next);
}

function getAllByUser(req, res, next) {
  bookingsService
    .getAllByUser(req.user.sub)
    .then((data) => res.json(data))
    .catch(next);
}

function updateFinished(req, res, next) {
  bookingsService
    .updateBooking(req.user.sub, req.body.booking, {
      finished: true,
      finished_at: new Date(),
    })
    .then((data) => res.json(data))
    .catch(next);
}

function nextTurnBooking(req, res, next) {
  bookingsService
    .nextTurnBooking(req.user.sub, req.body.booking)
    .then((data) => res.json(data))
    .catch(next);
}
