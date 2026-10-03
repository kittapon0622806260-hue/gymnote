const express = require('express');
const router = express.Router();
const Workout = require('../models/workout');
const WorkoutLog = require('../models/workoutLog')

router.post('/', async (req, res) => {
    try {
        const { title, day, target, exercises } = req.body;

        // ตรวจสอบข้อมูลเบื้องต้น
        if (!title || !day) {
            return res.status(400).json({
                success: false,
                message: 'กรุณากรอกชื่อโปรแกรมและเลือกวัน'
            });
        }

        // สร้าง Document ใหม่
        const newWorkout = new Workout({
            title,
            day,
            target,
            exercises
        });

        // บันทึกลง MongoDB
        const savedWorkout = await newWorkout.save();

        res.status(201).json({
            success: true,
            data: savedWorkout,
            message: 'สร้างตารางออกกำลังกายสำเร็จ'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
            error: error.message
        });
    }
});



router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, day, target, exercises } = req.body;

        const updatedWorkout = await Workout.findByIdAndUpdate(
            id,
            { title, day, target, exercises },
            { new: true }
        )
        if (!updatedWorkout) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลโปรแกรมนี้' });
        }
        res.status(200).json(updatedWorkout);
    } catch (error) {
        console.error('Update Error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล', error: error.message });
    }
})

router.get('/', async (req, res) => {
    try {
        // ดึงข้อมูลทั้งหมดและเรียงลำดับตามเวลาที่สร้างล่าสุด
        const workouts = await Workout.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: workouts.length,
            data: workouts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
            error: error.message
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const workout = await Workout.findById(req.params.id);

        if (!workout) {
            return res.status(404).json({ message: 'ไม่พบข้อมูล Routine นี้' });
        }
        res.json(workout);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedWorkout = await Workout.findByIdAndDelete(id);

        if (!deletedWorkout) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบข้อมูลที่ต้องการลบ'
            });
        }

        res.status(200).json({
            success: true,
            message: 'ลบข้อมูลสำเร็จ'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการลบข้อมูล',
            error: error.message
        });
    }
});

router.post('/workout-logs', async (req, res) => {
    try {
        const { workoutId, title, duration, exercises, completedAt } = req.body;

        const newLog = new WorkoutLog({
            workoutId,
            title,
            duration: duration || '00:00:00',
            exercises,
            completedAt: completedAt || new Date()
        });

        await newLog.save();

        res.status(201).json({
            message: 'บันทึกประวัติเรียบร้อยแล้ว',
            log: newLog
        });
    } catch (error) {
        console.error('Error saving log:', error);
        res.status(500).json({
            message: 'เกิดข้อผิดพลาดในการบันทึกประวัติ',
            error: error.message
        });
    }
});

module.exports = router;