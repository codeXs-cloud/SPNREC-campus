const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const Issue = require('../models/Issue');
const LostFound = require('../models/LostFound');


// 1. NOTICES (Public Read, Private Write/Delete)

router.get('/notices', async (req, res) => {
    try {
        const notices = await Notice.find().sort({ datePosted: -1 }).populate('author', 'username');
        res.json(notices);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/notices', async (req, res) => {
    const { title, description, category, authorId } = req.body;
    const newNotice = new Notice({ title, description, category, author: authorId });
    await newNotice.save();
    res.json(newNotice);
});

router.delete('/notices/:id', async (req, res) => {
    try {
        await Notice.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. ISSUES (Public Read, Private Write/Vote/Delete)
router.get('/complaints', async (req, res) => {
    try {
        const issues = await Issue.find().sort({ createdAt: -1 }).populate('studentId', 'username');
        res.json(issues);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/complaints', async (req, res) => {
    const { type, description, studentId } = req.body;
    const newIssue = new Issue({ type, description, studentId, likes: [], dislikes: [] });
    await newIssue.save();
    res.json(newIssue);
});

// VOTE HANDLER
router.patch('/complaints/:id/vote', async (req, res) => {
    const { username, type } = req.body; // type = 'like' or 'dislike'
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) return res.status(404).json({ msg: "Issue not found" });

        // Remove existing votes by this user (prevent double voting)
        issue.likes = issue.likes.filter(user => user !== username);
        issue.dislikes = issue.dislikes.filter(user => user !== username);

        // Add new vote
        if (type === 'like') issue.likes.push(username);
        if (type === 'dislike') issue.dislikes.push(username);

        await issue.save();
        res.json(issue);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/complaints/:id', async (req, res) => {
    try {
        await Issue.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// 3. LOST & FOUND (Public Read, Private Write/Delete)
router.get('/lostfound', async (req, res) => {
    try {
        const items = await LostFound.find().sort({ datePosted: -1 }).populate('author', 'username email');
        res.json(items);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/lostfound', async (req, res) => {
    const { type, description, authorId } = req.body;
    const newItem = new LostFound({ type, description, author: authorId });
    await newItem.save();
    res.json(newItem);
});

router.delete('/lostfound/:id', async (req, res) => {
    try {
        await LostFound.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;