const express = require('express');
const router = express.Router();
const WorkoutLog = require('../models/workoutLog');
const auth = require('../middleware/auth'); // นำเข้า middleware


router.get('/', auth, async (req, res) => {
    try {
        const logs = await WorkoutLog.find().sort({ completedAt: -1 }).limit(10);
        res.json(logs);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ message: 'Error fetching history', error: error.message });
    }
});

module.exports = router;