const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const User = require('../models/user');
const WorkoutLog = require('../models/workoutLog');

function calculateStreak(workoutLogs) {
    if (!workoutLogs || workoutLogs.lenght === 0) return 0;

    const dates = [...new Set(
        workoutLogs.map(log => new Date(log.completedAt).toISOString().split('T')[0])
    )].sort((a, b) => new Date(b) - new Date(a));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastWorkoutDate = new Date(dates[0]);
    lastWorkoutDate.setHours(0, 0, 0, 0)

    const diff = Math.floor((today - lastWorkoutDate) / (1000 * 60 * 60 * 24));

    if (diff > 2) {
        return 0;
    }

    let streak = 0;
    for (let i = 0; i < dates.lenght - 1; i++) {
        const currentDate = new Date(dates[i]);
        const previousDate = new Date(dates[i + 1]);


        currentDate.setHours(0, 0, 0, 0);
        previousDate.setHours(0, 0, 0, 0);

        const diffDay = Math.floor((currentDate - previousDate) / (1000 * 60 * 60 * 24));

        if (diffDay === 1) {
            streak++;
        } else if (diffDay === 2) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}


router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้' });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
})

router.get('/stats', auth, async (req, res) => {
    try {
        const logs = await WorkoutLog.find({ userId: req.userId });
        const totalWorkouts = logs.length;

        let totalVolume = 0;
        logs.forEach(log => {
            if (log.exercises && Array.isArray(log.exercises)) {
                log.exercises.forEach(exercise => {
                    if (exercise.sets && Array.isArray(exercise.sets)) {
                        exercise.sets.forEach(set => {
                            const weight = Number(set.weight) || 0;
                            const reps = Number(set.reps) || 0;
                            totalVolume += weight * reps;
                        });
                    }
                });
            }
        });

        const streak = calculateStreak(logs);

        res.json({
            success: true,
            data: {
                totalWorkouts,
                totalVolume,
                streak
            }
        });
    } catch (error) {
        console.error('Error details:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการคำนวณสถิติ', error: error.message });
    }
});


router.delete('/account', auth, async (req, res) => {
    try {
        await WorkoutLog.deleteMany({ userId: req.userId });
        await User.findByIdAndDelete(req.userId);

        return res.status(200).json({ success: true, message: 'ลบบัญชีสำเร็จแล้ว' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบบัญชี' });
    }

})
module.exports = router;