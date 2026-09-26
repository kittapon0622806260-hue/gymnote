// ดึง workoutId จาก URL
const urlParams = new URLSearchParams(window.location.search);
const workoutId = urlParams.get('id');

if (workoutId) {
    Edit(workoutId);
}

async function Edit(id) {
    try {
        const res = await fetch(`http://localhost:5000/api/workouts/${id}`);
        const data = await res.json();

        if (res.ok) {
           
            const nameInput = document.getElementById('routine-name');
            const daySelect = document.getElementById('target-day');
            const targetInput = document.getElementById('target-muscles');

            if (nameInput) nameInput.value = data.title || '';
            if (daySelect) daySelect.value = data.day ;
            if (targetInput) targetInput.value = data.target || '';

           
            const container = document.getElementById('exercises-container') 
            container.innerHTML = '';

            if (data.exercises && Array.isArray(data.exercises)) {
                data.exercises.forEach((ex, index) => {
                    const itemHtml = `
            <div class="exercise-item bg-white/5 border border-white/5 rounded-xl p-4 space-y-4 mb-4">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-1 rounded-md">
                  Exercise ${index + 1}
                </span>
                <button type="button" class="remove-exercise-btn text-xs text-[#8F9CAE] hover:text-red-400 transition">
                  ลบรายการ
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="md:col-span-1 space-y-1">
                  <label class="block text-[11px] text-[#8F9CAE]">ชื่อท่าเล่น *</label>
                  <input type="text" value="${ex.name || ''}" class="exercise-name w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" placeholder="เช่น Bench Press" required>
                </div>

                <div class="space-y-1">
                  <label class="block text-[11px] text-[#8F9CAE]">จำนวนเซ็ต (Sets)</label>
                  <input type="number" value="${ex.sets || 1}" min="1" class="exercise-sets w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" required>
                </div>

                <div class="space-y-1">
                  <label class="block text-[11px] text-[#8F9CAE]">จำนวนครั้ง (Reps)</label>
                  <input type="text" value="${ex.reps || ''}" class="exercise-reps w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" placeholder="เช่น 8-12" required>
                </div>
              </div>
            </div>
          `;
                    container.insertAdjacentHTML('beforeend', itemHtml);
                });
            }
        }
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
    }
}