const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: { type: String, enum: ['Event', 'Holiday', 'Exam'] },
    datePosted: { type: Date, default: Date.now },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Notice', NoticeSchema);