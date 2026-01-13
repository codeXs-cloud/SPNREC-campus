const mongoose = require('mongoose');

const LostFoundSchema = new mongoose.Schema({
    type: { type: String, enum: ['Lost', 'Found'] },
    description: String,
    datePosted: { type: Date, default: Date.now },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('LostFound', LostFoundSchema);