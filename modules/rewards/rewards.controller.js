const express = require('express');
const router = express.Router();
const rewardsService = require('./rewards.service');

// routes
router.get('/', getAll);

module.exports = router;

function getAll(req, res, next) {
  rewardsService
    .getAll()
    .then((rewards) => res.json(rewards))
    .catch(next);
}
