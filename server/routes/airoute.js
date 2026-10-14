const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const mongoose = require('mongoose');

// ป้องกัน Error การคอมไพล์ Model ซ้ำ
const WorkoutLog = mongoose.models.WorkoutLog || require('../models/WorkoutLog');
const auth = require('../middleware/auth');

const router = express.Router();

// ตรวจสอบ API Key ก่อนสร้าง client เพื่อป้องกัน crash ตั้งแต่ต้น
if (!process.env.GEMINI_API_KEY) {
    console.error('[AI Coach] CRITICAL: GEMINI_API_KEY is not set in environment variables!');
}

// กำหนดค่า Google Gen AI SDK ตามมาตรฐาน @google/genai ล่าสุด
// นำเข้า: const { GoogleGenAI } = require('@google/genai');
// สร้าง instance: new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
// เรียกใช้: await ai.models.generateContent({ model, contents, config })
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ลำดับโมเดลที่ใช้งาน — ระบบ Retry จะลองตามลำดับนี้อัตโนมัติ
// gemini-3.8-flash = โมเดลล่าสุดที่ Google API แนะนำ (ยืนยันจาก API error response)
// gemini-2.5-flash = ไม่รองรับ user ใหม่แล้ว (deprecated)
const GEMINI_MODELS = [
    'gemini-3.8-flash',   // โมเดลหลัก — ล่าสุด (ยืนยันจาก Google API)
    'gemini-2.0-flash',   // fallback ชั้น 1
    'gemini-1.5-flash',   // fallback ชั้น 2 — legacy แต่เชื่อถือได้
];

/**
 * เรียก Gemini API พร้อมระบบ Retry + Exponential Backoff + Fallback Model
 *
 * Flow ต่อ 1 model:
 *   503/429  attempt 1 → รอ ~1s → attempt 2 → รอ ~2s → attempt 3 → break (ลอง fallback)
 *   404      → break ทันที (ข้ามไป fallback โดยไม่ retry)
 *   error อื่น → throw ทันที (auth fail, quota หมด ฯลฯ)
 *
 * @param {object} baseParams - params สำหรับ generateContent (ไม่ต้องใส่ model)
 * @param {number} maxRetries - จำนวนครั้ง retry ต่อ 1 model (default 3)
 */
async function generateContentWithRetry(baseParams, maxRetries = 3) {
    let lastError;
    let lastErrIsOverload = false;

    for (const model of GEMINI_MODELS) {
        const params = { ...baseParams, model };
        lastErrIsOverload = false;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                console.log(`[AI Coach] Trying model: ${model} (attempt ${attempt + 1}/${maxRetries})`);
                return await ai.models.generateContent(params);
            } catch (err) {
                lastError = err;
                const errStatus = err.status || err.statusCode;

                const isOverloaded =
                    errStatus === 503 ||
                    errStatus === 429 ||
                    err.message?.includes('503') ||
                    err.message?.includes('UNAVAILABLE') ||
                    err.message?.includes('overloaded') ||
                    err.message?.includes('high demand') ||
                    err.message?.includes('rate limit');

                const isNotFound =
                    errStatus === 404 ||
                    err.message?.includes('not found') ||
                    err.message?.includes('does not exist') ||
                    err.message?.includes('no longer available');

                if (isNotFound) {
                    // model ไม่มีอยู่ → ข้ามไป fallback ทันที ไม่เสียเวลา retry
                    console.warn(`[AI Coach] Model "${model}" not found. Switching to next fallback...`);
                    break;
                }

                if (isOverloaded) {
                    lastErrIsOverload = true;
                    if (attempt < maxRetries - 1) {
                        // Exponential Backoff พร้อม jitter: ~1s, ~2s (±100ms random)
                        const baseDelay = 1000 * Math.pow(2, attempt);
                        const jitter = Math.floor(Math.random() * 200) - 100;
                        const waitMs = baseDelay + jitter;
                        console.warn(`[AI Coach] Model "${model}" overloaded. Backoff ${waitMs}ms (attempt ${attempt + 1}/${maxRetries})`);
                        await new Promise(resolve => setTimeout(resolve, waitMs));
                        continue;
                    } else {
                        // ✅ FIX: retry หมดแล้ว → break ออกจาก inner loop เพื่อลอง fallback
                        //    (ไม่ throw เพราะจะออกจาก GEMINI_MODELS loop ด้วย!)
                        console.warn(`[AI Coach] Model "${model}" still overloaded after ${maxRetries} attempts. Switching to next fallback...`);
                        break;
                    }
                }

                // error ประเภทอื่น (auth fail, quota หมด ฯลฯ) → throw ออกทันที
                throw err;
            }
        }
    }

    // ทุก model และทุก retry หมดแล้ว ยังไม่ได้คำตอบ
    console.error('[AI Coach] All models and retries exhausted. Last error:', lastError);
    lastError._allModelsExhausted = true;
    lastError._wasOverload = lastErrIsOverload;
    throw lastError;
}


router.post('/chat', auth, async (req, res) => {
    try {
        // ตรวจสอบว่า API Key มีค่าก่อนประมวลผล
        if (!process.env.GEMINI_API_KEY) {
            return res.status(503).json({
                success: false,
                message: 'AI service is currently unavailable. Please contact administrator.'
            });
        }

        const { message } = req.body;

        // ดึง userId อย่างปลอดภัย — รองรับทั้ง middleware ที่ set req.userId หรือ req.user
        const userId = req.userId || req.user?._id || req.user?.id;
        if (!userId) {
            console.error('[AI Coach] Cannot identify user: req.userId and req.user are both missing');
            return res.status(401).json({
                success: false,
                message: 'ไม่สามารถระบุตัวตนผู้ใช้ได้ กรุณา Login ใหม่อีกครั้งครับ'
            });
        }

        // ตรวจสอบ input จากผู้ใช้
        if (!message || typeof message !== 'string' || message.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'กรุณาส่งข้อความ (message) ที่ไม่ว่างเปล่ามาด้วยครับ'
            });
        }

        // 1. ดึงประวัติการออกกำลังกาย 10 รายการล่าสุด (ดึงอย่างปลอดภัยด้วย try/catch แยก)
        let workoutHistory = [];
        try {
            workoutHistory = await WorkoutLog.find({ userId }).sort({ date: -1 }).limit(10).lean();
        } catch (dbError) {
            // ถ้าดึง DB ไม่ได้ ไม่ crash — ให้ AI ทำงานต่อโดยไม่มี history
            console.error('[AI Coach] Failed to fetch WorkoutLog from DB:', dbError.message);
        }

        // 2. กำหนดกฎเหล็กให้ AI
        const systemInstruction = `
        คุณคือ Personal AI Fitness Coach ผู้เชี่ยวชาญด้านการออกกำลังกายและเวทเทรนนิ่ง
        กฎเหล็กของคุณ:
        1. ให้วิเคราะห์ประวัติการเล่นและตอบคำถามเกี่ยวกับ "การออกกำลังกาย, เวทเทรนนิ่ง, โภชนาการ, และสุขภาพ" เท่านั้น
        2. หากผู้ใช้ถามเรื่องอื่นที่ไม่เกี่ยวกับการออกกำลังกาย (เช่น การเมือง, เขียนโค้ด, คณิตศาสตร์, การทำอาหารทั่วไป, เรื่องส่วนตัว ฯลฯ) ให้ปฏิเสธอย่างสุภาพทันทีด้วยประโยคนี้: "ขออภัยครับ ผมตอบได้เฉพาะเรื่องเกี่ยวกับการออกกำลังกายและสุขภาพเท่านั้นครับ มีอะไรให้ผมช่วยแนะนำเกี่ยวกับการเล่นเวทหรือตารางซ้อมไหมครับ?"
        `;

        // 3. รวม context และคำถามเป็น message เดียวเพื่อความถูกต้องของ API
        const userPrompt = `ประวัติการเล่นล่าสุดของฉัน: ${JSON.stringify(workoutHistory)}\n\nคำถามของฉัน: ${message.trim()}`;

        // 4. เรียกใช้งาน Gemini API ผ่านระบบ Retry + Fallback
        // จะลอง gemini-2.5-flash → gemini-2.0-flash → gemini-1.5-flash อัตโนมัติ
        const response = await generateContentWithRetry({
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.3,
            }
        });

        // ตรวจสอบว่า response มีข้อความจริงก่อน return
        const replyText = response.text;
        if (!replyText) {
            console.error('[AI Coach] Empty response from Gemini API');
            return res.status(502).json({
                success: false,
                message: 'AI ไม่สามารถสร้างคำตอบได้ในขณะนี้ กรุณาลองใหม่อีกครั้งครับ'
            });
        }

        res.json({ success: true, reply: replyText });

    } catch (err) {
        // Log รายละเอียดแบบ Full เพื่อ debug ใน Terminal/Server Log
        console.error('[AI Coach Error Full Details]:', err);

        const errStatus = err.status || err.statusCode;
        const isOverload =
            err._wasOverload ||
            errStatus === 503 ||
            err.message?.includes('503') ||
            err.message?.includes('UNAVAILABLE') ||
            err.message?.includes('high demand');

        // ส่ง message ที่เป็นมิตรกับผู้ใช้ — ไม่ expose raw error JSON
        if (isOverload) {
            return res.status(503).json({
                success: false,
                message: '🔄 AI กำลังมีผู้ใช้งานจำนวนมาก กรุณารอสักครู่แล้วลองใหม่อีกครั้งครับ'
            });
        }

        res.status(500).json({
            success: false,
            message: err.message || 'Internal Server Error',
            errorName: err.name,
            stack: err.stack || String(err)
        });
    }
});

module.exports = router;