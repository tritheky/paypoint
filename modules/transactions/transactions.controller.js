const express = require('express');
const router = express.Router();
const transactionsService = require('./transactions.service');

// routes
router.get('/:id', getCurrentTransactionsByBooking);
router.post('/insert', insertTransaction);
router.post('/reset', clearTransactions);

module.exports = router;

function getCurrentTransactionsByBooking(req, res, next) {
  transactionsService
    .getCurrentTransactionsByBooking(req.user.sub, req.params.id)
    .then((data) => res.json(data))
    .catch(next);
}

function insertTransaction(req, res, next) {
  transactionsService
    .insertTransaction(req.user.sub, req.body.booking, req.body.reward)
    .then((data) => res.json(data))
    .catch(next);
}

function clearTransactions(req, res, next) {
  transactionsService
    .clearTransactions(req.user.sub)
    .then((data) => res.json(data))
    .catch(next);
}
