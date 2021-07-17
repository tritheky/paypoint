const config = require('config.json');
const helper = require('helpers/helper.js');
const jwt = require('jsonwebtoken');
const userModel = require('../dto/users.model');

module.exports = {
  authenticate,
  getAll,
  getById,
  create,
  update,
  deleteById,
};

async function authenticate({ phone, password, clientId }) {
  const user = await userModel.findOne({ phone: phone }).select('+password');

  if (!user) throw 'Username or password is incorrect';
  if (!(await helper.comparePassword(password, user.password))) {
    throw 'Mật khẩu không đúng.';
  }
  const token = jwt.sign(
    {
      userId: user.id,
      fullname: user.fullname,
      email: user.email,
      admin: true,
    },
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
  return await userModel.find({});
}

async function create(req) {
  await userModel.insertMany(req.body)
    .then((u) => {
      return user;
    })
    .catch((error) => {
      throw error;
    });
}
async function update() {
  return null;
  // return (await database.connection().select('*').from('users')).map((u) =>
  //   omitPassword(u),
  // );
}
async function getById(id) {
  return null;
  // return (await database.connection().select('*').from('users')).map((u) =>
  //   omitPassword(u),
  // );
}
async function deleteById(id) {
  return null;
  // return (await database.connection().select('*').from('users')).map((u) =>
  //   omitPassword(u),
  // );
}
