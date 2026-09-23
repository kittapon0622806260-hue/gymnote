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
      emptyState.style.display = "none"; // ซ่อนข้อความ "ไม่มีข้อมูล"
      const card = result.data.map(workout => {
        return `
    <div class="w-[320px]  min-w-[340px] md:min-w-[380px] shrink-0 bg-[#0F172A] border-2 border-slate-700/60 rounded-2xl p-6 shrink-0 snap-center space-y-4 shadow-xl">
    <!-- Header: ขยายขนาดฟอนต์ และเปลี่ยน Badge ให้สว่างชัด -->
    <div class="flex items-start justify-between pb-3 border-b border-slate-700/80">
      <div>
        <h3 class="text-xl font-black text-white tracking-wide mb-1">${workout.title}</h3>
        <p class="text-sm font-semibold text-emerald-400">Target: <span class="text-slate-200 font-bold">${workout.target}</span></p>
      </div>
      <span class="text-sm font-black bg-emerald-500 text-slate-950 px-3 py-1.5 rounded-lg tracking-wider uppercase shadow">
        ${workout.day}
      </span>
    </div>

    <!-- Exercise List: เพิ่ม Padding + ฟอนต์ตัวใหญ่ คอนทราสต์สูง -->
    <div class="space-y-2.5">
      ${workout.exercises.map(ex => `
        <div class="flex items-center justify-between text-sm py-3 px-4 bg-slate-800/90 border border-slate-700 rounded-xl shadow-sm">
          <span class="text-white font-bold tracking-wide">${ex.name}</span>
          <span class="text-emerald-300 font-black text-base">${ex.sets}x${ex.reps} <span class="text-xs font-semibold text-slate-300">(${ex.weight} kg)</span></span>
        </div>
      `).join('')}
    </div>
  </div>
  `;

      }).join('');
      workoutContainer.innerHTML = card;
    } else {
      emptyState.style.display = "block"; // แสดงข้อความ "ไม่มีข้อมูล"
    }

  } catch (error) {
    console.error('Error fetching workouts:', error);
  }
}

fetchWorkouts();

const scrollContainer = document.querySelector('.overflow-x-auto');

if (scrollContainer) {
  scrollContainer.addEventListener('wheel', (evt) => {
    // ถ้ามีการหมุนลูกกลิ้งเมาส์แนวตั้ง ให้เปลี่ยนเป็นเลื่อนแนวนอนแทน
    if (evt.deltaY !== 0) {
      evt.preventDefault();
      scrollContainer.scrollLeft += evt.deltaY;
    }
  });
}