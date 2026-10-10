const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const mongoose = require('mongoose');

// ป้องกัน Error การคอมไพล์ Model ซ้ำ
const WorkoutLog = mongoose.models.WorkoutLog || require('../models/WorkoutLog');
const auth = require('../middleware/auth');

const router = express.Router();

// กำหนดค่า Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post('/chat', auth, async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.userId;

        // 1. ดึงประวัติการออกกำลังกาย 10 รายการล่าสุด
        const workoutHistory = await WorkoutLog.find({ userId }).sort({ date: -1 }).limit(10);

        // 2. กำหนดกฎเหล็กให้ AI
        const systemInstruction = `
        คุณคือ Personal AI Fitness Coach ผู้เชี่ยวชาญด้านการออกกำลังกายและเวทเทรนนิ่ง
        กฎเหล็กของคุณ:
        1. ให้วิเคราะห์ประวัติการเล่นและตอบคำถามเกี่ยวกับ "การออกกำลังกาย, เวทเทรนนิ่ง, โภชนาการ, และสุขภาพ" เท่านั้น
        2. หากผู้ใช้ถามเรื่องอื่นที่ไม่เกี่ยวกับการออกกำลังกาย (เช่น การเมือง, เขียนโค้ด, คณิตศาสตร์, การทำอาหารทั่วไป, เรื่องส่วนตัว ฯลฯ) ให้ปฏิเสธอย่างสุภาพทันทีด้วยประโยคนี้: "ขออภัยครับ ผมตอบได้เฉพาะเรื่องเกี่ยวกับการออกกำลังกายและสุขภาพเท่านั้นครับ มีอะไรให้ผมช่วยแนะนำเกี่ยวกับการเล่นเวทหรือตารางซ้อมไหมครับ?"
        `;

        // 3. เรียกใช้งาน Gemini 2.5 Flash
        const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: [
                { role: 'user', parts: [{ text: `ประวัติการเล่นล่าสุดของฉัน: ${JSON.stringify(workoutHistory)}` }] },
                { role: 'user', parts: [{ text: `คำถามของฉัน: ${message}` }] }
            ],
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.3,
            }
        });

        res.json({ success: true, reply: response.text });

    } catch (error) {
        console.error("AI Coach Error:", error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการประมวลผลของ AI' });
    }
});

module.exports = router;