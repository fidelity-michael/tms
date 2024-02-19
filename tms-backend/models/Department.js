const mongoose = require('mongoose');

// Schema
const Department_Schema =  new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    university: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Department', Department_Schema);