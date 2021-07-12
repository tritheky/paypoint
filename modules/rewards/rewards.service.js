const database = require('../database');

module.exports = {
  getAll,
};

async function getAll() {
  return await database.connection().select('*').from('rewards');
}
