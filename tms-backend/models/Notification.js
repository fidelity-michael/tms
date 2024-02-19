const mongoose = require('mongoose');

// Schema
const Notification_Schema =  new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    receiver: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "sent"
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Notification', Notification_Schema);