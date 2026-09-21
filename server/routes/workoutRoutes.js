const express = require('express');
const router = express.Router();
const Workout = require('../models/workout');

// @route   POST /api/workouts
// @desc    สร้างตารางออกกำลังกายใหม่
// @access  Public
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

// @route   GET /api/workouts
// @desc    ดึงรายการตารางออกกำลังกายทั้งหมด
// @access  Public
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

module.exports = router;