const mongoose = require('mongoose');

// Schema
const University_Schema =  new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('University', University_Schema);