const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let user = new Schema({
    fullname: {type: String, required: true},
    phone: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true, select: false},
    admin: {type: Number, required: true},
    created: {type: Date, required: false},
    created_by: {type: Number, required: true},
    updated: {type: Date, required: false},
    updated_by: {type: Number, required: false},
});

// Export the model
module.exports = mongoose.model('user', user);