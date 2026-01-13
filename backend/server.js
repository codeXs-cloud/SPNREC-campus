require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); // Standard Node module for file paths

const app = express();

// 1. Middleware
app.use(express.json()); // Parse JSON bodies


// 2. Database Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Error:", err));

// 3. API Routes
// These routes handle data logic (Login, Signup, Notices, etc.)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/apiRoutes'));

// 4. SERVE FRONTEND (The Magic Part)

app.use(express.static(path.join(__dirname, '../frontend')));

// 5. Catch-All Route (FIXED with Regex to prevent PathError)

app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server (and Website) running on http://localhost:${PORT}`));