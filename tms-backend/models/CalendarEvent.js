const mongoose = require('mongoose');

// Schema
const CalendarEvent_Schema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('CalendarEvent', CalendarEvent_Schema);