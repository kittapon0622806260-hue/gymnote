const form = document.getElementById('registerForm');


form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        })
        const data = await res.json();

        if (res.ok) {
            alert('สมัครสมาชิกสำเร็จ');
            window.location.href = '/login.html';
        } else {
            alert(data.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
        }
    } catch (error) {
        console.error('Error:', error);
    }


})