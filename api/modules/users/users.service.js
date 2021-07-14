const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserModel = require('./users.model');

module.exports = {
  authenticate,
  getAll,
  cryptPassword,
  comparePassword,
  getById,
  create,
  update,
  deleteById,
};

async function authenticate({ phone, password, clientId }) {
  const user = await UserModel.findOne({ phone: phone }).select('+password');

  if (!user) throw 'Username or password is incorrect';
  if (password != user.password) {
    //if (!(await comparePassword(password, user.password))) {
    throw 'Mật khẩu không đúng.';
  }
  const token = jwt.sign(
    { sub: user.id, fullname: user.fullname, email: user.email, admin: true },
    config.secret,
    {
      expiresIn: process.env.JWT_EXP,
    },
  );
  return {
    token,
  };
}

async function getAll() {
  return await UserModel.find({});
}
async function create(req) {
  await UserModel.insertMany(req.body)
    .then((u) => {
      return user;
    })
    .catch((error) => {
      throw error;
    });
}
async function update() {
  return (await database.connection().select('*').from('users')).map((u) =>
    omitPassword(u),
  );
}
async function getById(id) {
  return (await database.connection().select('*').from('users')).map((u) =>
    omitPassword(u),
  );
}
async function deleteById(id) {
  return (await database.connection().select('*').from('users')).map((u) =>
    omitPassword(u),
  );
}
// helper functions

function omitPassword(user) {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

async function cryptPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

async function comparePassword(plainPass, hashword) {
  const match = await bcrypt.compare(plainPass, hashword);
  return match;
}
