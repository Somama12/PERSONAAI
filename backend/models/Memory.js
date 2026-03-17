const mongoose = require('mongoose');

const MemorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Work', 'Personal', 'Ideas', 'Learning', 'Health', 'Miscellaneous']
    },
    confidence: {
        type: Number,
        default: 1.0
    },
    source: {
        type: String,
        default: 'conversation'
    }
}, { timestamps: true });

module.exports = mongoose.model('Memory', MemorySchema);
