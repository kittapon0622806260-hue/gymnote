const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const workoutRoutes = require('./routes/workoutRoutes');


const app = express();

const connectDB = require('./config/db');
connectDB();


app.use(cors());
app.use(express.json());

app.use('/api/workouts', workoutRoutes); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));