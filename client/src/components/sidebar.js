
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

document.addEventListener('click', (e) => {
  const logoutBtn = e.target.closest('#logoutBtn');
  const model = document.getElementById('logoutModal')
  const cancle = document.getElementById('cancelLogoutBtn')
  const confirm = document.getElementById('confirmLogoutBtn')

  if (logoutBtn) {
    e.preventDefault();
    model.classList.remove('hidden')
  }
  if (cancle) {
    cancle.addEventListener('click', () => {
      model.classList.add('hidden')
    })
  }

  if (confirm) {
    confirm.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = '/login.html'
    })
  }

});

const aiCoachMenuBtn = document.getElementById('aiCoachMenuBtn');
const aiCoachModal = document.getElementById('aiCoachModal');
const closeAiModalBtn = document.getElementById('closeAiModalBtn');
const aiChatForm = document.getElementById('aiChatForm');
const aiUserInput = document.getElementById('aiUserInput');
const chatMessages = document.getElementById('chatMessages');

// 1. เปิด Popup เมื่อกดปุ่มใน Sidebar
if (aiCoachMenuBtn) {
  aiCoachMenuBtn.addEventListener('click', (e) => {
    e.preventDefault();
    aiCoachModal.classList.remove('hidden');
  });
}

// 2. ปิด Popup
if (closeAiModalBtn) {
  closeAiModalBtn.addEventListener('click', () => {
    aiCoachModal.classList.add('hidden');
  });
}

// 3. ส่งคำถามไปหา Backend AI
if (aiChatForm) {
  aiChatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = aiUserInput.value.trim();
    if (!message) return;

    // แสดงข้อความของผู้ใช้บนหน้าต่างแชท
    appendMessage('user', message);
    aiUserInput.value = '';

    // แสดงสถานะกำลังพิมพ์
    const loadingId = appendMessage('ai', 'กำลังคิดคำตอบ...');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });

      const data = await res.json();

      // ลบข้อความ "กำลังคิด..." แล้วแทนที่ด้วยคำตอบจริง
      document.getElementById(loadingId)?.remove();

      if (data.success) {
        appendMessage('ai', data.reply);
      } else {
        appendMessage('ai', 'เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง');
      }
    } catch (err) {
      console.error(err);
      document.getElementById(loadingId)?.remove();
      appendMessage('ai', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  });
}

// ฟังก์ชันสำหรับเพิ่มกล่องข้อความในแชท
function appendMessage(sender, text) {
  const msgId = 'msg-' + Date.now();
  const isUser = sender === 'user';

  const msgHTML = `
        <div id="${msgId}" class="flex gap-3 ${isUser ? 'flex-row-reverse' : ''}">
            <div class="w-8 h-8 rounded-lg ${isUser ? 'bg-blue-600' : 'bg-emerald-500/20 text-emerald-400'} flex items-center justify-center text-xs font-bold shrink-0">
                ${isUser ? 'You' : 'AI'}
            </div>
            <div class="${isUser ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-800 text-gray-200 rounded-tl-none'} p-3 rounded-2xl max-w-[80%] whitespace-pre-line">
                ${text}
            </div>
        </div>
    `;

  chatMessages.insertAdjacentHTML('beforeend', msgHTML);
  chatMessages.scrollTop = chatMessages.scrollHeight; // เลื่อนหน้าแชทลงล่างสุดอัตโนมัติ
  return msgId;
}

