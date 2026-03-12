const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        default: 'Miscellaneous',
        enum: ['Work', 'Personal', 'Ideas', 'Learning', 'Health', 'Miscellaneous']
    },
    role: {
        type: String,
        enum: ['user', 'ai'],
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
