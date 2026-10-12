
function timenow() {
  const dateEl = document.getElementById("date-now");
  if (!dateEl) return;

  const now = new Date();
  const options = {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  };

  dateEl.textContent = now.toLocaleDateString('en-US', options);
}

// Active navigation link highlighting
function highlightActiveNav() {
  const currentPath = window.location.pathname.toLowerCase();
  let currentKey = 'home';

  if (currentPath.includes('workout')) {
    currentKey = 'workouts';
  } else if (currentPath.includes('history')) {
    currentKey = 'history';
  } else if (currentPath.includes('profile')) {
    currentKey = 'profile';
  } else if (currentPath.endsWith('index.html') || currentPath === '/' || currentPath === '') {
    currentKey = 'home';
  }

  // Highlight desktop & drawer links
  document.querySelectorAll('.nav-link').forEach(link => {
    const navKey = link.dataset.nav;
    if (navKey === currentKey) {
      link.classList.remove('text-[#8F9CAE]');
      link.classList.add('text-[#22C55E]', 'bg-[#22C55E]/10', 'font-bold');
    }
  });

  // Highlight bottom bar items
  document.querySelectorAll('.nav-bottom-item').forEach(item => {
    const navKey = item.dataset.nav;
    if (navKey === currentKey) {
      item.classList.remove('text-[#8F9CAE]');
      item.classList.add('text-[#22C55E]', 'font-bold');
    }
  });
}

// Setup mobile sidebar drawer
function setupMobileDrawer() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const closeBtn = document.getElementById('closeMobileMenuBtn');
  const drawer = document.getElementById('mobileSidebar');
  const backdrop = document.getElementById('mobileSidebarBackdrop');

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.remove('-translate-x-full');
    backdrop?.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.add('-translate-x-full');
    backdrop?.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }

  menuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    openDrawer();
  });

  closeBtn?.addEventListener('click', closeDrawer);
  backdrop?.addEventListener('click', closeDrawer);

  // Close drawer if user clicks a nav link
  drawer?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeDrawer);
  });
}

// Setup user display across sidebar elements
async function setupUserProfile() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch('/api/user/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await res.json();
    if (result.success && result.data?.username) {
      document.querySelectorAll('.display-username, #displayUsername').forEach(el => {
        el.textContent = result.data.username;
      });
      const homeUsername = document.getElementById('username');
      if (homeUsername && !homeUsername.textContent) {
        homeUsername.textContent = result.data.username;
      }
    }
  } catch {
    // If offline or error, fail gracefully
  }
}

// Setup event listeners for logout & AI modal
document.addEventListener('DOMContentLoaded', () => {
  timenow();
  highlightActiveNav();
  setupMobileDrawer();
  setupUserProfile();
});

// Global click handler for logout and AI coach
document.addEventListener('click', (e) => {
  const logoutBtn = e.target.closest('#logoutBtn, .logout-btn');
  const logoutModal = document.getElementById('logoutModal');
  const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
  const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');

  if (logoutBtn) {
    e.preventDefault();
    logoutModal?.classList.remove('hidden');
  }

  if (cancelLogoutBtn && e.target === cancelLogoutBtn) {
    logoutModal?.classList.add('hidden');
  }

  if (confirmLogoutBtn && e.target === confirmLogoutBtn) {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
  }

  // AI Coach trigger
  const aiCoachTrigger = e.target.closest('#aiCoachMenuBtn, .ai-coach-btn');
  const aiCoachModal = document.getElementById('aiCoachModal');
  const closeAiModalBtn = document.getElementById('closeAiModalBtn');

  if (aiCoachTrigger) {
    e.preventDefault();
    aiCoachModal?.classList.remove('hidden');
  }

  if (closeAiModalBtn && (e.target === closeAiModalBtn || closeAiModalBtn.contains(e.target))) {
    aiCoachModal?.classList.add('hidden');
  }
});

// AI Coach form logic
const aiChatForm = document.getElementById('aiChatForm');
const aiUserInput = document.getElementById('aiUserInput');
const chatMessages = document.getElementById('chatMessages');

if (aiChatForm) {
  aiChatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = aiUserInput?.value?.trim();
    if (!message) return;

    appendMessage('user', message);
    if (aiUserInput) aiUserInput.value = '';

    const loadingId = appendMessage('ai', 'กำลังคิดคำตอบ...');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });

      const data = await res.json();
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

function appendMessage(sender, text) {
  if (!chatMessages) return '';
  const msgId = 'msg-' + Date.now();
  const isUser = sender === 'user';

  const msgHTML = `
    <div id="${msgId}" class="flex gap-2.5 sm:gap-3 ${isUser ? 'flex-row-reverse' : ''}">
      <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${isUser ? 'bg-blue-600' : 'bg-emerald-500/20 text-emerald-400'} flex items-center justify-center text-xs font-bold shrink-0">
        ${isUser ? 'You' : 'AI'}
      </div>
      <div class="${isUser ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-800 text-gray-200 rounded-tl-none'} p-2.5 sm:p-3 rounded-2xl max-w-[85%] whitespace-pre-line text-xs sm:text-sm">
        ${text}
      </div>
    </div>
  `;

  chatMessages.insertAdjacentHTML('beforeend', msgHTML);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return msgId;
}
