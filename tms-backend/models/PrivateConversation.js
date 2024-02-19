const mongoose = require('mongoose');

// Schema
const PrivateConversation_Schema = new mongoose.Schema({
    user1: {
        type: String,
        required: true
    },
    user2: {
        type: String,
        required: true
    },
    date: {         //date of creation
        type: Date,
        required: true
    },
    lastMessage: {  //last message sent
        type: Object,
        default: {}
    }
});

module.exports = mongoose.model('PrivateConversation', PrivateConversation_Schema);