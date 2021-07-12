const config = require('config.json');
const jwt = require('jsonwebtoken');
const database = require('../database');
const bcrypt = require('bcrypt');

module.exports = {
  authenticate,
  getAll,
  cryptPassword,
  comparePassword,
};

async function authenticate({ username, password }) {
  const users = await database
    .connection()
    .select(
      'id',
      'username',
      'idcard',
      'fullname',
      'phone',
      'admin',
      'password',
    )
    .from('users')
    .where({ username: username });

  if (!users || users.length === 0) throw 'Username or password is incorrect';

  const user = users[0];
  if (!(await comparePassword(password, user.password))) {
    throw 'Mật khẩu không đúng.';
  }
  const token = jwt.sign({ sub: user.id, admin: user.admin }, config.secret, {
    expiresIn: '1d',
  });
  return {
    ...omitPassword(user),
    token,
  };
}

async function getAll() {
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
