
document.addEventListener('DOMContentLoaded', () => {
  History();
});

async function History() {
  const container = document.getElementById('history-cards');
  if (!container) return;

  try {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/history', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) {
      throw new Error(`Server Error (Status: ${res.status})`);
    }
    const logs = await res.json();

    if (!Array.isArray(logs) || logs.length === 0) {
      container.innerHTML = `
        <div class="text-slate-500 text-center py-12 font-mono text-sm">
          NO WORKOUT HISTORY FOUND
        </div>`;
      return;
    }

    container.innerHTML = logs.map(log => createHistoryCardHTML(log)).join('');
  } catch (error) {
    console.error('Error loading history:', error);
    container.innerHTML = `
      <div class="text-red-400 text-center py-12 font-mono text-sm">
        FAILED TO LOAD WORKOUT HISTORY
      </div>`;
  }
}

function createHistoryCardHTML(log) {
  const formattedDate = new Date(log.completedAt || log.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const durationText = log.duration || '00:00:00';

  return `
    <div class="bg-[#111622] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6 mt-6">
      
      <!-- Header การ์ด -->
      <div class="flex items-center justify-between border-b border-slate-800/60 pb-4">
        <div class="flex items-center gap-3">
          <span class="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse"></span>
          <h2 class="text-xl font-black text-white tracking-wide uppercase">
            ${log.title || 'WORKOUT SESSION'}
          </h2>
        </div>
        <div class="text-right text-xs font-mono text-slate-400 space-x-2">
          <span>${formattedDate}</span>
          <span class="text-slate-600">•</span>
          <span class="text-[#22C55E] font-bold">${durationText}</span>
        </div>
      </div>

      <!-- รายการท่าทางที่เล่น -->
      <div class="space-y-5">
        ${(log.exercises || []).map(ex => {
    const completedSets = (ex.sets || []).filter(s => s.isCompleted || (s.weight && s.reps));

    if (completedSets.length === 0) return '';

    return `
            <div class="space-y-2">
              <h3 class="text-sm font-bold text-slate-200">${ex.name}</h3>
              <div class="flex flex-wrap gap-2">
                ${completedSets.map(s => `
                  <div class="bg-[#1a2130] border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1">
                    <span class="font-bold text-white">${s.weight}kg</span>
                    <span class="text-slate-500">×</span>
                    <span>${s.reps}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
  }).join('')}
      </div>

    </div>
  `;
}