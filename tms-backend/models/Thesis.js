const mongoose = require('mongoose');

// Schema
const Thesis_Schema =  new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    area: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: "No Description"
    },
    prerequisites: {
        type: String,
        default: " "
    },
    group: {
        type: String,
        required: true
    },
    professor: {
        type: String,
        minlength: 1,
        required: true
    },
    required_files: {
        type: [String],
        default: "No files required"
    },
    thesis_files: {
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

module.exports = mongoose.model('Thesis', Thesis_Schema);
