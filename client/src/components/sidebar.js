
document.addEventListener('click', (e) => {
  const logoutBtn = e.target.closest('#logoutBtn');
  
  if (logoutBtn) {
    e.preventDefault();
    localStorage.removeItem('token');
    window.location.href = '/login.html';
  }
});