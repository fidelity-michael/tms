const mongoose = require('mongoose');

// Schema
const ThesisReport_Schema =  new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    student: {
        type: String,
        required: true
    },
    report_files: {
        type: [String],
        default: "No files available"
    },
    isFinal: {
        type: Boolean,
        required: true
    },
    status: {
        type: String,
        default: "active"
    },
    date: {
        type: Date,
        default: Date.now()
    },
    comments: {
        type: [String],
        default: []
    }
});

module.exports = mongoose.model('ThesisReport', ThesisReport_Schema);