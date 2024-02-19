const mongoose = require('mongoose');

// Schema
const User_Schema =  new mongoose.Schema({
    first_name: {
        type: String,
        default: "FirstName"
    },
    last_name: {
        type: String,
        default: "LastName"
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: [String],
        required: true
    },
    group: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "active"
    },
    department: {
        type: String,
        default: "5f89b089099c8d21dc2d9ef8"
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('User', User_Schema);