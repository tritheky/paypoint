const express = require('express');
const router = express.Router();
const userService = require('./users.service');
// routes
router.post('/authenticate', authenticate);
router.post('/cryptPassword', cryptPassword);
router.get('/', getAll);

module.exports = router;

function authenticate(req, res, next) {
  userService
    .authenticate(req.body)
    .then((data) => res.json(data))
    .catch(next);
}

function getAll(req, res, next) {
  userService
    .getAll()
    .then((data) => res.json(data))
    .catch(next);
}

function cryptPassword(req, res, next) {
  userService
    .cryptPassword(req.body.password)
    .then((data) => res.json(data))
    .catch(next);
}
