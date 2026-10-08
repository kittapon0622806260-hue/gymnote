const express = require('express');
const router = express.Router();
const WorkoutLog = require('../models/workoutLog');
const auth = require('../middleware/auth'); // นำเข้า middleware

function getWeekly() {
    const now = new Date();
    const dayOfWeek = now.getDay()

    const diffToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);

    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { monday, sunday };
}

function parseDurationToSeconds(durationStr) {
    if (!durationStr || typeof durationStr !== 'string') return 0;

    const parts = durationStr.split(':');
    if (parts.length !== 3) return 0;

    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    const seconds = parseInt(parts[2], 10) || 0;

    return (hours * 3600) + (minutes * 60) + seconds;
}

router.get('/', auth, async (req, res) => {
    try {
        const { monday, sunday } = getWeekly()

        const logs = await WorkoutLog.find({
            userId: req.userId, 
            completedAt: { $gte: monday, $lte: sunday }
        }).lean();


        const totalSeconds = logs.reduce((acc, log) => {
            return acc + parseDurationToSeconds(log.duration);
        }, 0);

        const totalMinutes = Math.floor(totalSeconds / 60);
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;

        const timeTotalFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

        const WorkoutDay = new Set(
            logs.map(log => new Date(log.completedAt).toISOString().split('T')[0])
        );
        const days = WorkoutDay.size

        res.json({
            timeTotal: timeTotalFormatted,
            daysTrained: days,
            targetDays: 7
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
})




module.exports = router;
