const url = new URLSearchParams(window.location.search);
const id = url.get('id');


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
            }
        } catch (error) {
            console.error(error)
        }

    }
})
