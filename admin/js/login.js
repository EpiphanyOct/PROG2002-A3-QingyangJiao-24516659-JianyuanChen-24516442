// login.js - 管理端登录
document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value.trim();
  if (u === 'admin' && p === 'admin123') {
    localStorage.setItem('adminLoggedIn', '1');
    localStorage.setItem('adminUsername', u);
    location.href = 'dashboard.html';
  } else {
    alert('Invalid credentials');
  }
});