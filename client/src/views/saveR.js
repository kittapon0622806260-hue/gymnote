const url = new URLSearchParams(window.location.search);
const id = url.get('id');


let activeWorkout = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!id) {
        alert('ไม่พบข้อมูลโปรแกรมการออกกำลังกาย');
        window.location.href = 'workouts.html';
        return;
    } else {
        Save(id);
    }



    async function Save(id) {
        try {
            const res = await fetch(`http://localhost:5000/api/workouts/${id}`);
            const data = await res.json();

            if (res.ok) {

                const name = document.getElementById('title');
                const target = document.getElementById('target');

                if (name) name.innerText = data.title;
                if (target) target.innerText = data.target;

                activeWorkout = {
                    Id: data._id,
                    title: data.title,
                    target: data.target,
                    exercises: data.exercises.map(ex => ({
                        exerciseId: ex._id,
                        name: ex.name,
                        sets: Array.from({ length: ex.defaultSets || 3 }, (_, i) => ({
                            setNumber: i + 1,
                            weight: '',
                            reps: '',
                            isCompleted: false
                        }))
                    }))

                };

                renderExerciseCards(activeWorkout.exercises);

            }
        } catch (error) {
            console.error(error)
        }

    }
})

function renderExerciseCards(exercises) {
    const container = document.getElementById('exercise-container');
    if (!container) return;

    container.innerHTML = '';

    exercises.forEach((ex, exIdx) => {
        const setsRowsHTML = ex.sets.map((set, setIdx) => `
      <div id="set-row-${exIdx}-${setIdx}" 
           class="grid grid-cols-12 gap-3 items-center bg-[#0b0f19] hover:bg-[#111827] p-3 rounded-2xl border border-slate-800 transition-all duration-200 mb-3 shadow-inner">
        
        <!-- SET NUMBER -->
        <div class="col-span-2 text-center font-black text-slate-400 text-sm tracking-wider">
          ${set.setNumber}
        </div>
        
        <!-- PREV -->
        <div class="col-span-3 text-center text-xs font-bold text-slate-500 font-mono tracking-wide">
          ${set.prev || '-'}
        </div>
        
        <!-- INPUT KG -->
        <div class="col-span-3">
          <input type="number" 
                 placeholder="0" 
                 value="${set.weight}"
                 oninput="updateSetData(${exIdx}, ${setIdx}, 'weight', this.value)"
                 class="w-full bg-[#161f32] border border-slate-700/80 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 rounded-xl py-2.5 text-center text-emerald-400 font-extrabold text-base outline-none transition-all placeholder:text-slate-600 shadow-sm">
        </div>
        
        <!-- INPUT REPS -->
        <div class="col-span-2">
          <input type="number" 
                 placeholder="0" 
                 value="${set.reps}"
                 oninput="updateSetData(${exIdx}, ${setIdx}, 'reps', this.value)"
                 class="w-full bg-[#161f32] border border-slate-700/80 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 rounded-xl py-2.5 text-center text-emerald-400 font-extrabold text-base outline-none transition-all placeholder:text-slate-600 shadow-sm">
        </div>
        
        <!-- CHECK BUTTON -->
        <div class="col-span-2 flex justify-center">
          <button type="button" 
                  id="check-btn-${exIdx}-${setIdx}"
                  onclick="handleCheckSet(${exIdx}, ${setIdx})" 
                  class="w-9 h-9 rounded-xl border border-slate-700 bg-[#161f32] text-slate-400 hover:border-emerald-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all active:scale-90 flex items-center justify-center font-black text-base shadow-md">
            ✓
          </button>
        </div>
      </div>
    `).join('');

        const cardHTML = `
      <div class="bg-[#0e1626] border-2 border-slate-700/60 rounded-[2rem] p-6 mb-8 shadow-[0_15px_35px_rgba(0,0,0,0.6)] relative overflow-hidden">
        
        <!-- เส้นเรืองแสง Neon ข้างการ์ด -->
        <div class="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-emerald-400 via-teal-500 to-cyan-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]"></div>

        <!-- Card Header -->
        <div class="flex items-center justify-between mb-6 pl-3">
          <div class="flex items-center gap-3">
            <h3 class="text-2xl font-black text-white tracking-wide uppercase drop-shadow-md">${ex.name}</h3>
          </div>
          
          <span class="text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-4 py-1.5 rounded-full tracking-wider uppercase shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            ${ex.sets.length} SETS
          </span>
        </div>

        <!-- Table Head -->
        <div class="grid grid-cols-12 gap-3 text-center text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-2">
          <span class="col-span-2">SET</span>
          <span class="col-span-3">PREV</span>
          <span class="col-span-3">KG</span>
          <span class="col-span-2">REPS</span>
          <span class="col-span-2">DONE</span>
        </div>

        <!-- Set Rows Container -->
        <div class="space-y-1">${setsRowsHTML}</div>
      </div>
    `;

        container.innerHTML += cardHTML;
    });
}

function handleCheckSet(exIdx, setIdx) {
    const setObj = activeWorkout.exercises[exIdx].sets[setIdx];
    const btn = document.getElementById(`check-btn-${exIdx}-${setIdx}`);
    const row = document.getElementById(`set-row-${exIdx}-${setIdx}`);

    setObj.isCompleted = !setObj.isCompleted;

    if (setObj.isCompleted) {
        // ปุ่มเขียวสว่าง + Neon Glow
        btn.className = "w-8 h-8 rounded-lg bg-emerald-500 border border-emerald-300 text-slate-950 font-black flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all active:scale-90 text-sm";

        // ไฮไลต์ทั้งแถวเป็นสีเขียวใส
        if (row) {
            row.className = "grid grid-cols-12 gap-3 items-center bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/50 transition-all duration-200 mb-2.5 shadow-[0_0_10px_rgba(16,185,129,0.1)]";
        }
    } else {
        // คืนค่าเดิม
        btn.className = "w-8 h-8 rounded-lg border border-slate-600 bg-slate-800/80 text-slate-400 hover:border-emerald-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all active:scale-90 flex items-center justify-center font-bold text-sm shadow-md";

        if (row) {
            row.className = "grid grid-cols-12 gap-3 items-center bg-slate-900/90 hover:bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50 transition-all duration-200 mb-2.5 shadow-sm";
        }
    }
}

const back = document.getElementById('back-btn');
const exit = document.getElementById('exit-modal');
const modal = document.getElementById('modal-card');
const cancle = document.getElementById('cancel-exit-btn');
const confirm = document.getElementById('confirm-exit-btn');

if (back) {
    back.addEventListener('click', () => {
        exit.classList.remove('opacity-0', 'pointer-events-none')
        modal.classList.remove('scale-95');
        modal.classList.add('scale-100');
    });
};


if (cancle) {
    cancle.addEventListener('click', () => {
        exit.classList.add('opacity-0', 'pointer-events-none')
        modal.classList.add('scale-95');
        modal.classList.remove('scale-100');
    });
};

if (confirm) {
    confirm.addEventListener('click', () => {
        window.location.href = 'workouts.html'
    });
};


let startTime = null;
let active = null;


function timer() {
    startTime = Date.now();

    active = setInterval(() => {
        const now = Date.now();
        const Eseconds = Math.floor((now - startTime) / 1000);

        const hours = Math.floor(Eseconds / 3600);
        const minutes = Math.floor((Eseconds % 3600) / 60);
        const seconds = Eseconds % 60;


        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');

        const time = document.getElementById('active-timer');
        if (time) {
            time.textContent = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;

        }

    }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    timer();
});