const knex = require('knex');

let knexServer = null;

class Database {
  constructor() {
    if (!Database.instance) {
      Database.instance = this;
    }
    Database.instance.connection = this.connection.bind(this);
    Database.instance.init = this.init.bind(this);
    return Database.instance;
  }

  init() {
    const connectionObj = {
      client: 'pg',
      connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT,
      },
      searchPath: ['knex', 'public'],
    };
    console.log('===============initDatabase=================');
    knexServer = knex(connectionObj);
  }

  connection() {
    return knexServer;
  }
}

const instance = new Database();
Object.freeze(instance);

module.exports = instance;
