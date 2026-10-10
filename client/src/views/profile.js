async function fetchUser() {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '/login/login.html';
        return;
    }

    try {
        const res = await fetch('http://localhost:5000/api/user/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const result = await res.json();

        if (result.success) {
            const username = result.data.username;
            const email = result.data.email;


            document.getElementById('profileUsername').textContent = username;
            document.getElementById('profileEmail').textContent = email;

            const firstLetter = username ? username.charAt(0).toUpperCase() : 'U';
            document.getElementById('userAvatar').textContent = firstLetter;

        }
    } catch (error) {
        console.error('ไม่สามารถโหลดข้อมูล Profile ได้:', error);
    }
}

async function fetchStatus() {
    const token = localStorage.getItem('token');

    try {
        const res = await fetch('http://localhost:5000/api/user/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const result = await res.json();

        if (result.success) {
            const { totalWorkouts, totalVolume, streak } = result.data

            document.getElementById('statTotalWorkouts').textContent = totalWorkouts;
            document.getElementById('statTotalVolume').textContent = totalVolume;
            document.getElementById('statStreak').textContent = streak || 0;
        }
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดสถิติ:', error)

    }
}

const deleteModal = document.getElementById('deleteModal');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

deleteAccountBtn.addEventListener('click', () => {
    deleteModal.classList.remove('hidden');
});


cancelDeleteBtn.addEventListener('click', () => {
    deleteModal.classList.add('hidden');
})


confirmDeleteBtn.addEventListener('click', async () => {
    const token = localStorage.getItem('token')

    try {
        const res = await fetch('http://localhost:5000/api/user/account', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        const data = await res.json()
        if (data.success) {
            alert('ลบบัญชีผู้ใช้เรียบร้อยแล้ว');
            localStorage.removeItem('token');
            window.location.href = '/login.html';
        } else {
            alert(data.message || 'ไม่สามารถลบบัญชีได้');
            deleteModal.classList.add('hidden');
        }
    } catch (error) {
        console.error(error);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
        deleteModal.classList.add('hidden');
    }
})





document.addEventListener('DOMContentLoaded', () => {
    fetchUser()
    fetchStatus()
})