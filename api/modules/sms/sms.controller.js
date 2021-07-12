const express = require('express');
const router = express.Router();
const smsService = require('./sms.service');

// routes
router.post('/new_users', newUsers);
router.post('/reward_result', rewardResult);
router.post('/reward_done', rewardDone);

module.exports = router;

function newUsers(req, res, next) {
  smsService
    .newUsers(req.body)
    .then((data) => res.json(data))
    .catch(next);
}
function rewardResult(req, res, next) {
  smsService
    .rewardResult(req.body)
    .then((data) => res.json(data))
    .catch(next);
}
function rewardDone(req, res, next) {
  smsService
    .rewardDone(req.body)
    .then((data) => res.json(data))
    .catch(next);
}