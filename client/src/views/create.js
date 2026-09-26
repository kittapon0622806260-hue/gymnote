

const exercisesContainer = document.getElementById('exercises-container');
const addExerciseBtn = document.getElementById('add-exercise-btn');

// ฟังก์ชันคำนวณและอัปเดตเลข Exercise #1, #2, #3 ใหม่
function updateExerciseNumbers() {
    const items = exercisesContainer.querySelectorAll('.exercise-item');
    items.forEach((item, index) => {
        const numberSpan = item.querySelector('.exercise-number');
        if (numberSpan) {
            numberSpan.textContent = `Exercise ${index + 1}`;
        }
    });
}

// Event เมื่อกดปุ่ม "+ เพิ่มท่าฝึก"
addExerciseBtn?.addEventListener('click', () => {
    const newExerciseHTML = `
        <div class="exercise-item bg-white/5 border border-white/5 rounded-xl p-4 space-y-4">
            <div class="flex items-center justify-between">
                <span class="exercise-number text-xs font-bold text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-1 rounded-md">Exercise</span>
                <button type="button" class="remove-exercise-btn text-xs text-[#8F9CAE] hover:text-red-400 transition cursor-pointer">ลบรายการ</button>
            </div>

            <div class="exercise-card grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="md:col-span-1 space-y-1">
                    <label class="block text-[11px] text-[#8F9CAE]">ชื่อท่าเล่น *</label>
                    <input id="exercise-name" type="text" placeholder="เช่น Incline Dumbbell Press" required class="exercise-name w-full bg-[#06080C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22C55E]" />
                </div>
                <div class="space-y-1">
                    <label class="block text-[11px] text-[#8F9CAE]">จำนวนเซ็ต (Sets)</label>
                    <input id="exercise-sets" type="number" min="1" value="3" class="exercise-sets w-full bg-[#06080C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22C55E]" />
                </div>
                <div class="space-y-1">
                    <label class="block text-[11px] text-[#8F9CAE]">จำนวนครั้ง (Reps)</label>
                    <input id="exercise-reps"   type="text" placeholder="เช่น 10-12" value="10-12" class="exercise-reps w-full bg-[#06080C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22C55E]" />
                </div>
            </div>
        </div>
        `;

    exercisesContainer.insertAdjacentHTML('beforeend', newExerciseHTML);
    updateExerciseNumbers();
});

// Event สำหรับกด "ลบรายการ" (ใช้ Event Delegation)
exercisesContainer?.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-exercise-btn')) {
        const item = e.target.closest('.exercise-item');
        if (exercisesContainer.children.length > 1) {
            item.remove();
            updateExerciseNumbers();
        } else {
            alert('ต้องมีอย่างน้อย 1 ท่าฝึกครับ');
        }
    }
});

const form = document.getElementById('workout-form');

async function createWorkout(e) {
    e.preventDefault();

    const exerciseCards = document.querySelectorAll('.exercise-card');

    const exercise = Array.from(exerciseCards).map(card => {
        return {
            name : card.querySelector('.exercise-name').value,
            sets : card.querySelector('.exercise-sets').value,
            reps : card.querySelector('.exercise-reps').value
        }
    })
    console.log(exercise)

    const workoutData = {
        title : document.getElementById('routine-name').value,
        day : document.getElementById('target-day').value,
        target : document.getElementById('target-muscles').value,
        exercises : exercise
    }

    try {
        const response = await fetch('http://localhost:5000/api/workouts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workoutData)
        });

        const result = await response.json();

        if (result.success) {
            alert('สร้างตารางฝึกเรียบร้อยแล้ว');
            window.location.href = '/workouts';
        }
    } catch (error) {
        console.error('Error creating workout:', error);
        alert('เกิดข้อผิดพลาดในการสร้างตารางฝึก');
    }
}


form.addEventListener('submit', createWorkout);



