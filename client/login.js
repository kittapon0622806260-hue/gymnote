const loginForm = document.getElementById('loginForm');


loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;


    try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.token);
            alert('เข้าสู่ระบบสำเร็จ');
            window.location.href = '/index.html'
        } else {
            alert(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
        }
    } catch (error) {
        console.error(err);
    }
})