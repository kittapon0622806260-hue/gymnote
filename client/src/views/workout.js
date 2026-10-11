const emptyState = document.getElementById("empty");
const workoutContainer = document.getElementById("workout-container");

async function fetchWorkouts() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/workouts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await response.json();
    if (result.success && result.data.length > 0) {
      emptyState.style.display = "none";
      workoutContainer.style.display = "flex";

      const card = result.data.map(workout => {
        return `<div class="w-[280px] sm:w-[320px] md:w-[360px] shrink-0 bg-[#0F172A] border-2 border-slate-700/60 rounded-2xl p-4 sm:p-6 snap-center space-y-4 shadow-xl">
  <!-- ส่วน Header ของการ์ด -->
  <div class="flex items-start justify-between pb-3 border-b border-slate-700/80">
    <div class="min-w-0 pr-2">
      <h3 class="text-lg sm:text-xl font-black text-white tracking-wide mb-1 truncate">${workout.title}</h3>
      <p class="text-xs sm:text-sm font-semibold text-emerald-400">Target: <span class="text-slate-200 font-bold">${workout.target}</span></p>
    </div>

    <!-- ฝั่งขวา: ปุ่มการจัดการ (แก้ไข + ลบ) และ Badge วัน -->
    <div class="flex flex-col items-end gap-2 -mt-1 shrink-0">
      <div class="flex items-center gap-1.5">
        <!-- ปุ่มแก้ไข (Edit) -->
        <button 
          type="button" 
          class="edit-btn text-slate-400 hover:text-amber-400 transition-colors duration-200 p-1 rounded-lg hover:bg-slate-800 focus:outline-none cursor-pointer"
          data-id="${workout._id}"
          title="Edit Routine"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="size-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
        </button>

        <!-- ปุ่มลบ (Delete) -->
        <button 
          type="button" 
          class="delete-btn text-slate-400 hover:text-rose-500 transition-colors duration-200 p-1 rounded-lg hover:bg-slate-800 focus:outline-none cursor-pointer"
          data-id="${workout._id}"
          title="Delete Routine"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="size-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </button>
      </div>

      <!-- Badge แสดงวัน -->
      <div class="text-[11px] sm:text-xs font-black bg-emerald-500 text-slate-950 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg tracking-wider uppercase shadow">
        ${workout.day}
      </div>
    </div>
  </div>

  <!-- ส่วนแสดงรายการท่าฝึก (Exercises List) -->
  <div class="space-y-2">
    ${workout.exercises.map(ex => `
      <div class="flex items-center justify-between text-xs sm:text-sm py-2.5 px-3 sm:px-4 bg-slate-800/90 border border-slate-700 rounded-xl shadow-sm">
        <span class="text-white font-bold tracking-wide truncate pr-2">${ex.name}</span>
        <span class="text-emerald-300 font-black text-sm sm:text-base shrink-0">${ex.sets}x${ex.reps}</span>
      </div>
    `).join('')}
  </div>
  <button 
  type="button" 
  class="start-btn w-full mt-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 text-xs sm:text-sm cursor-pointer"
  data-id="${workout._id}"
>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4 sm:size-5">
    <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
  </svg>
  Start Workout
</button>
</div>
`;
      }).join('');

      workoutContainer.innerHTML = card;
    } else {
      workoutContainer.innerHTML = "";
      workoutContainer.style.display = "none";
      emptyState.style.display = "block";
    }

  } catch (error) {
    console.error('Error fetching workouts:', error);
  }
}

fetchWorkouts();

const scrollContainer = document.querySelector('.overflow-x-auto');

if (scrollContainer) {
  scrollContainer.addEventListener('wheel', (e) => {
    const hasHorizontalScroll = scrollContainer.scrollWidth > scrollContainer.clientWidth;
    if (hasHorizontalScroll) {
      e.preventDefault();
      scrollContainer.scrollLeft += e.deltaY;
    }
  }, { passive: false });
}

const deleteModal = document.getElementById('delete-modal');
const workoutsContainer = document.getElementById('workouts-container');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const confirmDelete = document.getElementById('confirm-delete-btn');

workoutsContainer.addEventListener('click', (event) => {
  const deleteBtn = event.target.closest('.delete-btn');
  if (deleteBtn) {
    deleteModal.classList.remove('hidden');
    deleteModal.dataset.pendingId = deleteBtn.dataset.id;
    document.body.style.overflow = 'hidden';
  }
});

cancelDeleteBtn.addEventListener('click', () => {
  deleteModal.classList.add('hidden');
  deleteModal.dataset.pendingId = '';
  document.body.style.overflow = '';
});

confirmDelete.addEventListener('click', async () => {
  const workoutId = deleteModal.dataset.pendingId;
  if (workoutId) {
    try {
      const token = localStorage.getItem('token');
      const respone = await fetch(`http://localhost:5000/api/workouts/${workoutId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (respone.ok) {
        deleteModal.classList.add('hidden');
        deleteModal.dataset.pendingId = '';
        document.body.style.overflow = '';
        fetchWorkouts();
      } else {
        console.error("ลบไม่สำเร็จ");
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาด', error);
    }
  }
});

document.addEventListener('click', (e) => {
  const editBtn = e.target.closest('.edit-btn');
  if (editBtn) {
    const editId = editBtn.dataset.id;
    if (editId) {
      window.location.href = `/workouts/edit.html?id=${editId}`;
    }
  }
});

workoutContainer.addEventListener('click', async (e) => {
  const startBtn = e.target.closest('.start-btn');
  if (startBtn) {
    const id = startBtn.dataset.id;
    window.location.href = `saveR.html?id=${id}`;
  }
});

let isEditing = false;
let allPrograms = [];
let weeklySchedule = {};

function toggleEditMode() {
  isEditing = !isEditing;
  const editBtn = document.getElementById('editBtn');

  if (isEditing) {
    editBtn.textContent = 'บันทึกตาราง';
    editBtn.className = 'w-full sm:w-auto text-center bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer';
  } else {
    editBtn.textContent = 'แก้ไขตาราง';
    editBtn.className = 'w-full sm:w-auto text-center bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer';
    saveWeeklySchedule();
  }

  renderScheduleUI();
}

async function loadScheduleData() {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/workouts', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    allPrograms = Array.isArray(data) ? data : (data.workouts || data.data || []);

    const savedSchedule = localStorage.getItem('my_weekly_schedule');
    if (savedSchedule) {
      weeklySchedule = JSON.parse(savedSchedule);
    }

    renderScheduleUI();
  } catch (err) {
    console.error("Error loading schedule data:", err);
  }
}

function renderScheduleUI() {
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const todayCode = dayMap[new Date().getDay()];

  days.forEach(day => {
    const viewEl = document.getElementById(`view-${day}`);
    const editEl = document.getElementById(`edit-${day}`);
    const selectEl = document.getElementById(`select-${day}`);
    const actionEl = document.getElementById(`action-${day}`);
    const titleEl = document.getElementById(`title-${day}`);
    const descEl = document.getElementById(`desc-${day}`);

    selectEl.innerHTML = '<option value="">-- เลือกโปรแกรม --</option>';
    allPrograms.forEach(prog => {
      const selected = weeklySchedule[day] === prog._id ? 'selected' : '';
      selectEl.innerHTML += `<option value="${prog._id}" ${selected}>${prog.title}</option>`;
    });

    const assignedWorkoutId = weeklySchedule[day];
    const assignedProgram = allPrograms.find(p => p._id === assignedWorkoutId);

    if (assignedProgram) {
      titleEl.textContent = assignedProgram.title;
      descEl.textContent = `${assignedProgram.exercises ? assignedProgram.exercises.length : 0} Exercises`;
    } else {
      titleEl.textContent = 'พักผ่อน / ยังไม่ระบุ';
      descEl.textContent = 'Rest & Recovery';
    }

    if (isEditing) {
      viewEl.classList.add('hidden');
      editEl.classList.remove('hidden');
      actionEl.innerHTML = '';
    } else {
      viewEl.classList.remove('hidden');
      editEl.classList.add('hidden');

      if (day === todayCode && assignedProgram) {
        actionEl.innerHTML = `
          <button onclick="startWorkout('${assignedProgram._id}')" class="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 sm:px-4 py-2 rounded-xl transition shadow-lg shadow-blue-600/20 whitespace-nowrap cursor-pointer">
              เริ่มเล่น ➔
          </button>
        `;
      } else {
        actionEl.innerHTML = '';
      }
    }
  });
}

function saveWeeklySchedule() {
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  days.forEach(day => {
    const selectEl = document.getElementById(`select-${day}`);
    weeklySchedule[day] = selectEl.value;
  });

  localStorage.setItem('my_weekly_schedule', JSON.stringify(weeklySchedule));
}

function startWorkout(programId) {
  window.location.href = `saveR.html?id=${programId}`;
}

document.addEventListener('DOMContentLoaded', loadScheduleData);