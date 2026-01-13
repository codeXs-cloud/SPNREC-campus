const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
    type: { type: String, enum: ['Hostel', 'WiFi', 'Classroom'] },
    description: String,
    status: { type: String, default: 'Open' }, // Open, In Progress, Resolved
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Changed from simple number to Arrays to track users
    likes: [{ type: String }], 
    dislikes: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Issue', IssueSchema);