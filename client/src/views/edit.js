// ดึง workoutId จาก URL
const urlParams = new URLSearchParams(window.location.search);
const workoutId = urlParams.get('id');

const exercisesContainer = document.getElementById('exercises-container');
const addExerciseBtn = document.getElementById('add-exercise-btn');

function updateExerciseNumbers() {
  if (!exercisesContainer) return;
  const items = exercisesContainer.querySelectorAll('.exercise-item');
  items.forEach((item, index) => {
    const numberSpan = item.querySelector('.exercise-number');
    if (numberSpan) {
      numberSpan.textContent = `Exercise ${index + 1}`;
    }
  });
}

addExerciseBtn?.addEventListener('click', () => {
  const newExerciseHTML = `
    <div class="exercise-item bg-white/5 border border-white/5 rounded-xl p-3.5 sm:p-4 space-y-3 sm:space-y-4 mb-4">
      <div class="flex items-center justify-between">
        <span class="exercise-number text-xs font-bold text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-1 rounded-md">
          Exercise
        </span>
        <button type="button" class="remove-exercise-btn text-xs text-[#8F9CAE] hover:text-red-400 transition cursor-pointer">
          ลบรายการ
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div class="sm:col-span-1 space-y-1">
          <label class="block text-[11px] text-[#8F9CAE]">ชื่อท่าเล่น *</label>
          <input type="text" value="" class="exercise-name w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#22C55E]" placeholder="เช่น Bench Press" required>
        </div>

        <div class="space-y-1">
          <label class="block text-[11px] text-[#8F9CAE]">จำนวนเซ็ต (Sets)</label>
          <input type="number" value="3" min="1" class="exercise-sets w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#22C55E]" required>
        </div>

        <div class="space-y-1">
          <label class="block text-[11px] text-[#8F9CAE]">จำนวนครั้ง (Reps)</label>
          <input type="text" value="8-12" class="exercise-reps w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#22C55E]" placeholder="เช่น 8-12" required>
        </div>
      </div>
    </div>
  `;
  exercisesContainer?.insertAdjacentHTML('beforeend', newExerciseHTML);
  updateExerciseNumbers();
});

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

if (workoutId) {
  Edit(workoutId);
}

async function Edit(id) {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/workouts/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}` 
      }
    });

    const data = await res.json();

    if (res.ok) {
      const nameInput = document.getElementById('routine-name');
      const daySelect = document.getElementById('target-day');
      const targetInput = document.getElementById('target-muscles');

      if (nameInput) nameInput.value = data.title || '';
      if (daySelect) daySelect.value = data.day || 'MON';
      if (targetInput) targetInput.value = data.target || '';

      const container = document.getElementById('exercises-container');
      if (container) {
        container.innerHTML = '';

        if (data.exercises && Array.isArray(data.exercises)) {
          data.exercises.forEach((ex, index) => {
            const itemHtml = `
              <div class="exercise-item bg-white/5 border border-white/5 rounded-xl p-3.5 sm:p-4 space-y-3 sm:space-y-4 mb-4">
                <div class="flex items-center justify-between">
                  <span class="exercise-number text-xs font-bold text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-1 rounded-md">
                    Exercise ${index + 1}
                  </span>
                  <button type="button" class="remove-exercise-btn text-xs text-[#8F9CAE] hover:text-red-400 transition cursor-pointer">
                    ลบรายการ
                  </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div class="sm:col-span-1 space-y-1">
                    <label class="block text-[11px] text-[#8F9CAE]">ชื่อท่าเล่น *</label>
                    <input type="text" value="${ex.name || ''}" class="exercise-name w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#22C55E]" placeholder="เช่น Bench Press" required>
                  </div>

                  <div class="space-y-1">
                    <label class="block text-[11px] text-[#8F9CAE]">จำนวนเซ็ต (Sets)</label>
                    <input type="number" value="${ex.sets || 1}" min="1" class="exercise-sets w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#22C55E]" required>
                  </div>

                  <div class="space-y-1">
                    <label class="block text-[11px] text-[#8F9CAE]">จำนวนครั้ง (Reps)</label>
                    <input type="text" value="${ex.reps || ''}" class="exercise-reps w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#22C55E]" placeholder="เช่น 8-12" required>
                  </div>
                </div>
              </div>
            `;
            container.insertAdjacentHTML('beforeend', itemHtml);
          });
        }
      }
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
  }
}

const workoutForm = document.getElementById('workout-form');

if (workoutForm) {
  workoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('routine-name')?.value;
    const day = document.getElementById('target-day')?.value;
    const target = document.getElementById('target-muscles')?.value;

    const exerciseItem = document.querySelectorAll('.exercise-item');
    const exercises = [];

    exerciseItem.forEach((item) => {
      const name = item.querySelector('.exercise-name')?.value;
      const sets = item.querySelector('.exercise-sets')?.value;
      const reps = item.querySelector('.exercise-reps')?.value;

      if (name) {
        exercises.push({
          name: name,
          sets: Number(sets) || 0,
          reps: reps || ''
        });
      }
    });

    const updatedData = { title, day, target, exercises };

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/workouts/${workoutId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(updatedData)
      });

      if (res.ok) {
        alert('อัปเดตโปรแกรมออกกำลังกายเรียบร้อยแล้ว!');
        window.location.href = 'workouts.html';
      } else {
        const errorData = await res.json();
        alert(`เกิดข้อผิดพลาด: ${errorData.message || 'ไม่สามารถบันทึกได้'}`);
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการบันทึก:', error);
      alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  });
}