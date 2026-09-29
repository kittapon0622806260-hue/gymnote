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
    cancle.addEventListener('click' , () => {
        exit.classList.add('opacity-0', 'pointer-events-none')
        modal.classList.add('scale-95');
        modal.classList.remove('scale-100');
    });
};

if (confirm) {
    confirm.addEventListener('click' , () => {
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