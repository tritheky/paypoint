const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserSchema = new Schema({
    fullname: {type: String, required: true},
    phone: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    created: {type: Date, required: false},
    created_by: {type: Number, required: true},
    created: {type: Date, required: false},
    created_by: {type: Number, required: true},
});

// Export the model
module.exports = mongoose.model('UserModel', UserSchema);