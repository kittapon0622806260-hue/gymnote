const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const workoutRoutes = require('./routes/workoutRoutes');
const history = require('./routes/historyRoutes');
const dashBoard = require('./routes/dashboard');
const authRoutes = require('./routes/authRoutes');
const userProfile = require('./routes/profileRoutes');
const aiCoachRoutes = require('./routes/airoute');
const path = require('path');

// ให้เซิร์ฟเวอร์อ่านไฟล์จากโฟลเดอร์ client ด้านนอก


const app = express();

const connectDB = require('./config/db');
connectDB();


app.use(cors());
app.use(express.json());


// 1. เสิร์ฟ Static File ทั้งหมดในโฟลเดอร์ client/dist
app.use(express.static(path.join(__dirname, '../client/dist')));

// 2. ใช้ Regex (/.^/) เพื่อรองรับทุกเส้นทางสำหรับ SPA โดยไม่ใช้เครื่องหมาย *
app.get(/.^/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/history', history);
app.use('/api/dashboard', dashBoard)
app.use('/api/user', userProfile)
app.use('/api/ai', aiCoachRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));