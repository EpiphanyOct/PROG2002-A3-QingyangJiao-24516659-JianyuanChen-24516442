// registration.js
const API_BASE_URL = window.location.origin + '/api';

let currentEvent = null;

document.addEventListener('DOMContentLoaded', initReg);

async function initReg() {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) {
    showActivitySelector();   // ← 关键：无 ID 时显示活动列表
    return;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/events/${id}`);
    currentEvent = await res.json();
    showEventInfo();
    setupForm();
  } catch (e) {
    alert('Failed to load event');
    location.href = 'search.html';
  }
}

/* ---------- 无 ID：活动选择器 ---------- */
async function showActivitySelector() {
  document.getElementById('reg-form-container').style.display = 'none';
  const infoBox = document.getElementById('reg-event-info');
  infoBox.innerHTML = `
    <p class="info">Please select an event first.</p>
    <div id="event-list" class="events-grid"></div>`;

  const res = await fetch(`${API_BASE_URL}/events`);
  const list = await res.json();
  document.getElementById('event-list').innerHTML = list.map(ev => `
<div class="event-card" data-id="${ev.id}">
  <div class="event-header"><h4>${ev.title}</h4></div>
  <div class="event-meta">
    <div><i class="fas fa-calendar"></i> ${new Date(ev.event_date).toLocaleDateString()}</div>
    <div><i class="fas fa-map-marker-alt"></i> ${ev.location}</div>
  </div>
  <button class="btn btn-primary btn-sm" onclick="selectEvent(${ev.id})">Choose</button>
</div>`).join('');
}

function selectEvent(evId) {
  history.replaceState({}, '', `?id=${evId}`);
  location.reload();
}

/* ---------- 有 ID：显示活动 + 表单 ---------- */
function showEventInfo() {
  document.getElementById('reg-event-info').innerHTML = `
<div class="event-card">
  <div class="event-header"><h3>${currentEvent.title}</h3></div>
  <div class="event-meta">
    <div><i class="fas fa-calendar"></i> ${new Date(currentEvent.event_date).toLocaleDateString()}</div>
    <div><i class="fas fa-map-marker-alt"></i> ${currentEvent.location}</div>
    <div><i class="fas fa-ticket"></i> ${currentEvent.ticket_price == 0 ? 'Free' : `$${currentEvent.ticket_price}`}</div>
  </div>
  <p class="event-description">${currentEvent.description}</p>
</div>`;
}

function setupForm() {
  document.getElementById('regForm').addEventListener('submit', handleSubmit);
}

/* ---------- 提交报名 ---------- */
async function handleSubmit(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = {
    event_id: currentEvent.id,
    user_name: fd.get('user_name').trim(),
    user_email: fd.get('user_email').trim(),
    tickets_purchased: +fd.get('tickets_purchased')
  };
  const res = await fetch(`${API_BASE_URL}/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  if (res.ok) {
    alert('Registration successful!');
    location.href = 'index.html';
  } else {
    alert(json.error || 'Registration failed');
  }
}