const mongoose = require('mongoose');

class Database {
  constructor() {
    if (!Database.instance) {
      Database.instance = this;
    }
    Database.instance.init = this.init.bind(this);
    return Database.instance;
  }

  init() {
    // Connecting to the database
    mongoose.set('useCreateIndex', true);
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log("Successfully connected to the database");
    }).catch(err => {
        console.log('Could not connect to the database. Exiting now...', err);
        process.exit();
    });
  }
  
}

const instance = new Database();
Object.freeze(instance);

module.exports = instance;
