const mongoose = require('mongoose');

// Schema
const AssignedThesis_Schema =  new mongoose.Schema({
    thesis: {
        type: String,
        required: true
    },
    professor: {
        type: String,
        required: true
    },
    supervisor: {
        type: [String],
        required: true
    },
    student: {
        type: String,
        required: true
    },
    title_greek: {
        type: String,
        default: ""
    },
    title_english: {
        type: String,
        default: ""
    },
    grade: {
        type: String,
        default: ""
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

module.exports = mongoose.model('AssignedThesis', AssignedThesis_Schema);