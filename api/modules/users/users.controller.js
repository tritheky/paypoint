const express = require('express');
const router = express.Router();
const userService = require('./users.service');
// routes
router.post('/authenticate', authenticate);
router.post('/cryptPassword', cryptPassword);
router.get('/', getAll);
router.get('/:id', getBy);
router.post('/', create);
router.post('/', update);
router.post('/', deleteBy);

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

function getBy(req, res, next) {
  userService
    .getBy(req.param.id)
    .then((data) => res.json(data))
    .catch(next);
}

function deleteBy(req, res, next) {
  userService
    .deleteBy(req.param.id)
    .then((data) => res.json(data))
    .catch(next);
}

function create(req, res, next) {
  userService
    .create()
    .then((data) => res.json(data))
    .catch(next);
}

function update(req, res, next) {
  userService
    .update()
    .then((data) => res.json(data))
    .catch(next);
}

function cryptPassword(req, res, next) {
  userService
    .cryptPassword(req.body.password)
    .then((data) => res.json(data))
    .catch(next);
}
