const mongoose = require('mongoose');

const SourceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    filename: {
        type: String
    },
    url: {
        type: String
    },
    type: {
        type: String,
        required: true,
        enum: ['pdf', 'url']
    },
    contentChunks: [{
        text: String,
        embedding: [Number]
    }]
}, { timestamps: true });

module.exports = mongoose.model('Source', SourceSchema);
