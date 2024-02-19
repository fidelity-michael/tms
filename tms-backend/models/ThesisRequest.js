const mongoose = require('mongoose');

// Schema
const ThesisRequest_Schema =  new mongoose.Schema({
    thesis: {
        type: String,
        required: true
    },
    professor: {
        type: String,
        required: true
    },
    student: {
        type: String,
        required: true
    },
    required_files: {
        type: [String],
        default: "No files available"
    },
    status: {
        type: String,
        default: "active"
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('ThesisRequest', ThesisRequest_Schema);