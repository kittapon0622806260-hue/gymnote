function timenow() {
  let now = new Date();

  // ตั้งค่าแสดงผลแบบ ภาษาอังกฤษ (en-US)
  const options = {
    weekday: 'long',  // แสดงชื่อวันแบบเต็ม เช่น Tuesday
    month: 'short',   // แสดงชื่อเดือนแบบย่อ เช่น Oct
    day: 'numeric'    // แสดงวันที่ เช่น 24
  };

  document.getElementById("date-now").textContent = now.toLocaleDateString('en-US', options);
}

timenow();


const emptyState = document.getElementById("empty");
const workoutContainer = document.getElementById("workout-container");

async function fetchWorkouts() {
  try {
    const response = await fetch('http://localhost:5000/api/workouts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const result = await response.json();
    if (result.success && result.data.length > 0) {
      // มีข้อมูล: แสดง container การ์ด และซ่อน emptyState
      emptyState.style.display = "none";
      workoutContainer.style.display = "flex"; // หรือ "grid" ตาม CSS Layout ที่ใช้

      const card = result.data.map(workout => {
        return `<div class="w-[320px] min-w-[340px] md:min-w-[380px] shrink-0 bg-[#0F172A] border-2 border-slate-700/60 rounded-2xl p-6 snap-center space-y-4 shadow-xl">
  <!-- ส่วน Header ของการ์ด -->
  <div class="flex items-start justify-between pb-3 border-b border-slate-700/80">
    <div>
      <h3 class="text-xl font-black text-white tracking-wide mb-1">${workout.title}</h3>
      <p class="text-sm font-semibold text-emerald-400">Target: <span class="text-slate-200 font-bold">${workout.target}</span></p>
    </div>

    <!-- ฝั่งขวา: ปุ่มการจัดการ (แก้ไข + ลบ) และ Badge วัน -->
    <div class="flex flex-col items-end gap-2 -mt-1">
      <div class="flex items-center gap-1.5">
        <!-- ปุ่มแก้ไข (Edit) ไอคอนดินสอเรียบๆ -->
        <button 
          type="button" 
          class="edit-btn text-slate-400 hover:text-amber-400 transition-colors duration-200 p-1 rounded-lg hover:bg-slate-800 focus:outline-none"
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
          class="delete-btn text-slate-400 hover:text-rose-500 transition-colors duration-200 p-1 rounded-lg hover:bg-slate-800 focus:outline-none"
          data-id="${workout._id}"
          title="Delete Routine"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="size-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </button>
      </div>

      <!-- Badge แสดงวัน -->
      <div class="text-xs font-black bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-lg tracking-wider uppercase shadow">
        ${workout.day}
      </div>
    </div>
  </div>

  <!-- ส่วนแสดงรายการท่าฝึก (Exercises List) -->
  <div class="space-y-2.5">
    ${workout.exercises.map(ex => `
      <div class="flex items-center justify-between text-sm py-3 px-4 bg-slate-800/90 border border-slate-700 rounded-xl shadow-sm">
        <span class="text-white font-bold tracking-wide">${ex.name}</span>
        <span class="text-emerald-300 font-black text-base">${ex.sets}x${ex.reps}</span>
      </div>
    `).join('')}
  </div>
</div>`;
      }).join('');

      workoutContainer.innerHTML = card;
    } else {
      // ไม่มีข้อมูล: ล้าง HTML การ์ดเดิม ซ่อน container และแสดง emptyState
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
  scrollContainer.addEventListener('wheel', (evt) => {
    const hasHorizontalScroll = scrollContainer.scrollWidth > scrollContainer.clientWidth;

    // 2. ถ้าล้นหน้าจอ ให้ดักจับการ Scroll เพื่อเปลี่ยนเป็นเลื่อนแนวนอน
    if (hasHorizontalScroll) {
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    }
  });
}


const deleteModal = document.getElementById('delete-modal');
const workoutsContainer = document.getElementById('workouts-container');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const confirmDelete = document.getElementById('confirm-delete-btn');

workoutsContainer.addEventListener('click', (event) => {
  const deleteBtn = event.target.closest('.delete-btn');
  if (deleteBtn) {
    deleteModal.classList.remove('hidden')
    deleteModal.dataset.pendingId = deleteBtn.dataset.id;
    document.body.style.overflow = 'hidden';
  }
});
cancelDeleteBtn.addEventListener('click', () => {
  deleteModal.classList.add('hidden');
  deleteModal.dataset.pendingId = '';
  document.body.style.overflow = '';
})

confirmDelete.addEventListener('click', async () => {
  const workoutId = deleteModal.dataset.pendingId;
  if (workoutId) {
    try {
      const respone = await fetch(`http://localhost:5000/api/workouts/${workoutId}`, {
        method: 'DELETE'
      })
      if (respone.ok) {
        deleteModal.classList.add('hidden');
        deleteModal.dataset.pendingId = ''
        document.body.style.overflow = ''

        fetchWorkouts();
      } else {
        console.error("ลบไม่สำเร็จ")
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาก', error)
    }
  }
})

// ดักจับการกดปุ่ม Edit จากทั้งหน้าจอ
document.addEventListener('click', (e) => {
  // หาปุ่มที่มี class 'edit-btn' หรือปุ่มไอคอนแก้ไขรูปดินสอ
  const editBtn = e.target.closest('.edit-btn');

  if (editBtn) {
    // อ่านค่า _id จาก attribute data-id ของปุ่มนั้น
    const editId = editBtn.dataset.id;

    if (editId) {
      // Redirect ไปยังหน้า edit.html
      window.location.href = `/workouts/edit.html?id=${editId}`;
    }
  }
});