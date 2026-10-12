

async function loadDash() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const res = await fetch('/api/dashboard', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!res.ok) throw new Error('Failed to fetch stats');

        const data = await res.json();

        const timeTotal = document.getElementById('workouts-stat-time');
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

    if (token) {
        // ถ้า Login แล้ว -> ซ่อนปุ่ม Login/Register
        if (authButtons) authButtons.classList.add('hidden');
    } else {
        const currentPath = window.location.pathname.toLowerCase();
        if (!currentPath.endsWith('login.html') && !currentPath.endsWith('register.html')) {
            window.location.href = '/login.html';
        }
    }
});
