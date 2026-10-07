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

async function loadDash() {
    try {
        const res = await fetch('http://localhost:5000/api/dashboard')
        if (!res.ok) throw new Error('Failed to fetch stats');

        const data = await res.json();

        const timeTotal = document.getElementById('workouts-stat-time')
        if (timeTotal) {
            timeTotal.textContent = data.timeTotal || "0m";
        }

        const workoutsDay = document.getElementById('workouts-stat-days');
        if (workoutsDay) {
            workoutsDay.textContent = `${data.daysTrained} / ${data.targetDays}`;
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}


document.addEventListener('DOMContentLoaded', loadDash);


document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const authButtons = document.getElementById('authButtons');
    const userProfile = document.getElementById('userProfile');
    const logoutBtn = document.getElementById('logoutBtn');

    if (token) {
        // ถ้า Login แล้ว -> ซ่อนปุ่ม Login/Register, แสดงส่วน Profile
        if (authButtons) authButtons.classList.add('hidden');
        if (userProfile) userProfile.classList.remove('hidden');
    } else {
        window.location.href = '/login.html'; 
    }

    // ปุ่ม Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.reload(); // โหลดหน้าใหม่เพื่ออัปเดต UI
        });
    }
});
