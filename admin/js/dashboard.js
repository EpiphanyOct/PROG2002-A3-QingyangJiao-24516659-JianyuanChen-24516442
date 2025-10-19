// PROG2002 A3 - Admin Dashboard 
const API_BASE_URL = window.location.origin + '/api';

/* ---------- utilities ---------- */
const formatDate = d => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const formatTimeAgo = date => {
    const sec = Math.floor((new Date() - new Date(date)) / 1000);
    if (sec < 60) return 'just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} min ago`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h} hour${h>1?'s':''} ago`;
    const d = Math.floor(h / 24);
    return `${d} day${d>1?'s':''} ago`;
};

/* ---------- init ---------- */
document.addEventListener('DOMContentLoaded', initDashboard);

async function initDashboard() {
    checkLogin();
    setWelcome();
    try {
        await Promise.all([loadStats(), loadActivities()]);
        initCharts();
    } catch (e) {
        showError('Dashboard load failed');
    }
}

function checkLogin() {
    if (!localStorage.getItem('adminLoggedIn')) location.href = 'login.html';
    const name = localStorage.getItem('adminUsername') || 'Admin';
    document.getElementById('username').textContent = name;
    document.getElementById('userAvatar').textContent = name[0].toUpperCase();
}

function setWelcome() {
    const h = new Date().getHours();
    const greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    const name = localStorage.getItem('adminUsername') || 'Admin';
    document.getElementById('welcomeMessage').textContent = `${greet}, ${name}!`;
}

async function loadStats() {
    try {
        const [evRes, regRes, catRes] = await Promise.all([
            fetch(`${API_BASE_URL}/events/stats/overview`),
            fetch(`${API_BASE_URL}/registrations`),
            fetch(`${API_BASE_URL}/categories`)
        ]);
        const ev = (await evRes.json()).data || {};
        const reg = (await regRes.json()).data || [];
        const cat = (await catRes.json()).data || [];

        // totals
        document.getElementById('totalEvents').textContent = ev.events?.total_events || 0;
        document.getElementById('totalRegistrations').textContent = reg.length;
        document.getElementById('totalRevenue').textContent = '$' + (ev.events?.total_raised || 0).toLocaleString();
        document.getElementById('totalCategories').textContent = cat.length;

        // mock % change
        ['eventsChange', 'registrationsChange', 'revenueChange', 'categoriesChange'].forEach(id => {
            const change = Math.floor(Math.random() * 20) + 5;
            document.getElementById(id).innerHTML = `<i class="fas fa-arrow-up"></i> +${change}% this month`;
        });
    } catch (e) {
        console.error(e);
    }
}

async function loadActivities() {
    const acts = generateMockActivities();
    const container = document.getElementById('activitiesList');
    container.innerHTML = acts.map(act => `
<div class="registration-item fade-in">
    <div class="registration-avatar"><i class="${act.icon}"></i></div>
    <div class="registration-content">
        <div class="registration-user">${act.title}</div>
        <div class="registration-event">${act.desc}</div>
        <div class="registration-time">${formatTimeAgo(act.time)}</div>
    </div>
</div>`).join('');
}

function generateMockActivities() {
    const now = new Date();
    return [
        { title: 'New Event Created', desc: 'Spring Charity Gala added', time: new Date(now - 5 * 60 * 1000), icon: 'fas fa-calendar' },
        { title: 'Registration', desc: 'Alice registered for City Run', time: new Date(now - 15 * 60 * 1000), icon: 'fas fa-user-plus' },
        { title: 'Admin Login', desc: 'Admin logged in', time: new Date(now - 30 * 60 * 1000), icon: 'fas fa-user' },
        { title: 'System Backup', desc: 'Daily backup completed', time: new Date(now - 60 * 60 * 1000), icon: 'fas fa-cog' },
        { title: 'Event Updated', desc: 'Music Concert info modified', time: new Date(now - 2 * 60 * 60 * 1000), icon: 'fas fa-edit' }
    ];
}

function initCharts() {
    // Events trend (mock SVG)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const evData = [12, 15, 18, 22, 25, 28];
    const regData = [150, 180, 220, 280, 320, 380];
    document.getElementById('eventsChart').innerHTML = `
<svg width="100%" height="200" viewBox="0 0 400 200">
  <polyline points="${months.map((m, i) => `${40 + i * 60},${180 - evData[i] * 5}`).join(' ')}" fill="none" stroke="#3498db" stroke-width="3"/>
  <polyline points="${months.map((m, i) => `${40 + i * 60},${180 - regData[i] * 0.4}`).join(' ')}" fill="none" stroke="#27ae60" stroke-width="3"/>
  ${months.map((m, i) => `<circle cx="${40 + i * 60}" cy="${180 - evData[i] * 5}" r="4" fill="#3498db"/><circle cx="${40 + i * 60}" cy="${180 - regData[i] * 0.4}" r="4" fill="#27ae60"/>`).join('')}
  ${months.map((m, i) => `<text x="${40 + i * 60}" y="195" text-anchor="middle" font-size="12" fill="#7f8c8d">${m}</text>`).join('')}
</svg>`;

    // Categories pie (mock)
    const cat = [{ name: 'Gala', count: 8, color: '#3498db' }, { name: 'Run', count: 12, color: '#27ae60' }, { name: 'Concert', count: 6, color: '#f39c12' }, { name: 'Auction', count: 4, color: '#9b59b6' }, { name: 'Community', count: 10, color: '#e74c3c' }, { name: 'Education', count: 7, color: '#1abc9c' }];
    const total = cat.reduce((s, c) => s + c.count, 0);
    document.getElementById('categoriesChart').innerHTML = `
<div style="display:flex;align-items:center;height:100%;padding:20px;">
  <svg width="180" height="180" viewBox="0 0 200 200">${cat.map((c, i) => {
        const angle = c.count / total * 360;
        const start = cat.slice(0, i).reduce((s, k) => s + k.count, 0) / total * 360;
        const end = start + angle;
        const x1 = 100 + 80 * Math.cos((start - 90) * Math.PI / 180);
        const y1 = 100 + 80 * Math.sin((start - 90) * Math.PI / 180);
        const x2 = 100 + 80 * Math.cos((end - 90) * Math.PI / 180);
        const y2 = 100 + 80 * Math.sin((end - 90) * Math.PI / 180);
        const large = angle > 180 ? 1 : 0;
        return `<path d="M 100 100 L ${x1} ${y1} A 80 80 0 ${large} 1 ${x2} ${y2} Z" fill="${c.color}" stroke="#fff" stroke-width="2"/>`;
    }).join('')}</svg>
  <div style="margin-left:20px;">
    <h4 style="margin-bottom:10px;">Category Distribution</h4>
    ${cat.map(c => `<div style="display:flex;align-items:center;margin-bottom:5px;"><div style="width:12px;height:12px;background:${c.color};margin-right:8px;border-radius:2px;"></div><span style="font-size:0.85rem;">${c.name}: ${c.count}</span></div>`).join('')}
  </div>
</div>`;
}

/* ---------- error & logout ---------- */
function showError(msg) {
    const err = document.createElement('div');
    err.style.cssText = 'position:fixed;top:100px;left:50%;transform:translateX(-50%);background:#e74c3c;color:#fff;padding:15px 25px;border-radius:8px;z-index:1000;box-shadow:0 5px 15px rgba(0,0,0,.2);';
    err.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${msg}`;
    document.body.appendChild(err);
    setTimeout(() => err.remove(), 5000);
}

function logout() {
    if (confirm('Logout?')) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        location.href = 'login.html';
    }
}