const mongoose = require('mongoose');

// Schema
const Message_Schema = new mongoose.Schema({
    sender: {
        type: String,
        required: true
    },
    chatId: {        //id of the conversation it belongs
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    files: {
        type: [String],
        default: []
    },
    read: {             //includes the users that read this message
        type: [String],
        required: true
    },
    date: {
      type: Date,
      required: true
    }
});

module.exports = mongoose.model('Message', Message_Schema);