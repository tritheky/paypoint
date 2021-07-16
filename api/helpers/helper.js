const bcrypt = require('bcrypt');
const config = require('config.json');

async function cryptPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

async function comparePassword(plainPass, hashword) {
  const match = await bcrypt.compare(plainPass, hashword);
  return match;
}

module.exports = {
  cryptPassword,
  comparePassword,
};
