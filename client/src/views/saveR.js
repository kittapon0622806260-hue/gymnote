
let activeworkout = null;


async function Save(id) {
    try {
        const res = await fetch(`http://localhost:5000/api/workouts/${id}`);
        const data = await res.json();

        if (res.ok) {
            const name = document.getElementById('title');
            const target = document.getElementById('target');

            if (name) name.innerText = data.title;
            if (target) target.innerText = data.target;

            activeworkout = {
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

            renderExerciseCards(activeworkout.exercises);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}


function updateSetData(exIdx, setIdx, field, value) {
    if (activeworkout && activeworkout.exercises[exIdx]?.sets[setIdx]) {
        activeworkout.exercises[exIdx].sets[setIdx][field] = value;
    }
}


function handleCheckSet(exIdx, setIdx) {
    if (!activeworkout || !activeworkout.exercises[exIdx]?.sets[setIdx]) return;

    const setObj = activeworkout.exercises[exIdx].sets[setIdx];
    const btn = document.getElementById(`check-btn-${exIdx}-${setIdx}`);
    const row = document.getElementById(`set-row-${exIdx}-${setIdx}`);

    setObj.isCompleted = !setObj.isCompleted;

    if (setObj.isCompleted) {
        if (btn) btn.className = "w-8 h-8 rounded-lg bg-emerald-500 border border-emerald-300 text-slate-950 font-black flex items-center justify-center transition-all";
        if (row) row.className = "grid grid-cols-12 gap-3 items-center bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30 mb-2.5 transition-all";
    } else {
        if (btn) btn.className = "w-8 h-8 rounded-lg border border-slate-600 bg-slate-800/80 text-slate-400 hover:border-emerald-500 flex items-center justify-center transition-all";
        if (row) row.className = "grid grid-cols-12 gap-3 items-center bg-[#0b0f19] hover:bg-[#111827] p-2.5 rounded-xl border border-slate-800/80 mb-2.5 transition-all";
    }

    
}


function renderExerciseCards(exercises) {
    const container = document.getElementById('exercise-container');
    if (!container) return;

    container.innerHTML = '';

    exercises.forEach((ex, exIdx) => {
        const setsRowsHTML = ex.sets.map((set, setIdx) => `
      <div id="set-row-${exIdx}-${setIdx}" class="grid grid-cols-12 gap-3 items-center bg-[#0b0f19] hover:bg-[#111827] p-2.5 rounded-xl border border-slate-800/80 mb-2.5 transition-all">
        <div class="col-span-2 text-center font-black text-slate-400 text-sm tracking-wider">
          ${set.setNumber}
        </div>
        <div class="col-span-3 text-center text-xs font-bold text-slate-500 font-mono tracking-wide">
          ${set.prev || '-'}
        </div>
        <div class="col-span-3">
          <input type="number" 
                 placeholder="0" 
                 value="${set.weight}" 
                 oninput="updateSetData(${exIdx}, ${setIdx}, 'weight', this.value)" 
                 class="w-full bg-[#161f32] border border-slate-700/80 focus:border-emerald-400 text-center text-white font-bold rounded-lg py-1.5 outline-none">
        </div>
        <div class="col-span-2">
          <input type="number" 
                 placeholder="0" 
                 value="${set.reps}" 
                 oninput="updateSetData(${exIdx}, ${setIdx}, 'reps', this.value)" 
                 class="w-full bg-[#161f32] border border-slate-700/80 focus:border-emerald-400 text-center text-white font-bold rounded-lg py-1.5 outline-none">
        </div>
        <div class="col-span-2 flex justify-center">
          <button type="button" 
                  id="check-btn-${exIdx}-${setIdx}" 
                  onclick="handleCheckSet(${exIdx}, ${setIdx})" 
                  class="w-8 h-8 rounded-lg border border-slate-600 bg-slate-800/80 text-slate-400 hover:border-emerald-500 flex items-center justify-center transition-all">
            ✓
          </button>
        </div>
      </div>
    `).join('');

        container.innerHTML += `
      <div class="bg-[#0b0f17] border border-slate-800/90 rounded-2xl p-5 mb-6 text-slate-200">
        <div class="flex items-center justify-between mb-4 pl-1">
          <h3 class="text-2xl font-black text-white tracking-wide uppercase">${ex.name}</h3>
          <span class="text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-3 py-1 rounded-full">
            ${ex.sets.length} SETS
          </span>
        </div>
        <div class="grid grid-cols-12 gap-3 text-center text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
          <span class="col-span-2">SET</span>
          <span class="col-span-3">PREV</span>
          <span class="col-span-3">KG</span>
          <span class="col-span-2">REPS</span>
          <span class="col-span-2">DONE</span>
        </div>
        <div class="space-y-1">${setsRowsHTML}</div>
      </div>
    `;
    });
}



document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const workoutId = urlParams.get('id');
    if (workoutId) Save(workoutId);
});


async function finishWorkout() {
    if (!activeworkout) {
        alert('ไม่พบข้อมูลการออกกำลังกาย');
        return;
    }
    let hasValidSet = false;

    for (const ex of activeworkout.exercises) {
        for (const set of ex.sets) {
            
            if (set.isCompleted && (set.weight !== '' || set.reps !== '')) {
                hasValidSet = true;
                break;
            }
        }
        if (hasValidSet) break;
    }


    if (!hasValidSet) {
        alert('กรุณากรอกข้อมูลน้ำหนัก/จำนวนครั้ง และกดติ๊กถูก (✓) อย่างน้อย 1 เซ็ตก่อนบันทึกครับ');
        return;
    }

    try {
        // ยิง POST ไปที่ Endpoint สำหรับเก็บประวัติ
        const res = await fetch('http://localhost:5000/api/workouts/workout-logs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                workoutId: activeworkout.Id,
                title: activeworkout.title,
                exercises: activeworkout.exercises,
                completedAt: new Date(),
            }),
        });

        if (res.ok) {
            alert('บันทึกประวัติการออกกำลังกายเรียบร้อยแล้ว!');
            window.location.href = '/workouts.html';
        } else {
            const errorData = await res.json();
            alert(`บันทึกไม่สำเร็จ: ${errorData.message || 'เกิดข้อผิดพลาด'}`);
        }
    } catch (error) {
        console.error('Error saving log:', error);
        alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
}

window.updateSetData = updateSetData;
window.handleCheckSet = handleCheckSet;
window.Save = Save;
window.finishWorkout = finishWorkout;

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
