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


const app = express();

const connectDB = require('./config/db');
connectDB();


app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/history', history);
app.use('/api/dashboard', dashBoard)
app.use('/api/user', userProfile)
app.use('/api/ai', aiCoachRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));