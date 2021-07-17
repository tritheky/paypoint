const express = require('express');
const router = express.Router();
const authService = require('./auth.service');
// routes
router.post('/token', token);
router.post('/signout', signout);
router.post('/refreshtoken', refreshToken);

module.exports = router;

function token(req, res, next) {
  authService
    .token(req.body)
    .then((data) => res.json(data))
    .catch(next);
}

function signout(req, res, next) {
  console.log();
  authService
    .signout(req.headers.authorization.replace('Bearer ', ''))
    .then((data) => res.json(data))
    .catch(next);
}

function refreshToken(req, res, next) {
  authService
    .refreshToken(req.body)
    .then((data) => res.json(data))
    .catch(next);
}
