// dashboard.js - 管理端首页统计
const API_BASE_URL = window.location.origin + '/api';

document.addEventListener('DOMContentLoaded', initDashboard);

async function initDashboard() {
  if (!localStorage.getItem('adminLoggedIn')) location.href = 'login.html';
  const name = localStorage.getItem('adminUsername') || 'Admin';
  const h = new Date().getHours();
  const greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  document.getElementById('welcomeMessage').textContent = `${greet}, ${name}!`;

  await loadStats();
  loadActivities();
}

async function loadStats() {
  const [evRes, catRes] = await Promise.all([
    fetch(`${API_BASE_URL}/events`),
    fetch(`${API_BASE_URL}/categories`)
  ]);
  const events = await evRes.json();
  const categories = await catRes.json();

  document.getElementById('totalEvents').textContent = events.length;
  document.getElementById('totalCategories').textContent = categories.length;

  // 注册数 = 每条 event 里的 registrations 长度之和
  const totalReg = events.reduce((s, e) => s + (e.registrations ? e.registrations.length : 0), 0);
  document.getElementById('totalRegistrations').textContent = totalReg;
}

function loadActivities() {
  const acts = [
    { title: 'New Event Created', desc: 'Spring Charity Gala added', time: new Date(Date.now() - 5 * 60 * 1000) },
    { title: 'Registration', desc: 'Alice registered for City Run', time: new Date(Date.now() - 15 * 60 * 1000) },
    { title: 'Admin Login', desc: 'Admin logged in', time: new Date(Date.now() - 30 * 60 * 1000) }
  ];
  const container = document.getElementById('activitiesList');
  container.innerHTML = acts.map(act => `
<div class="registration-item">
  <div class="registration-content">
    <div class="registration-user">${act.title}</div>
    <div class="registration-event">${act.desc}</div>
    <div class="registration-time">${new Date(act.time).toLocaleString()}</div>
  </div>
</div>`).join('');
}