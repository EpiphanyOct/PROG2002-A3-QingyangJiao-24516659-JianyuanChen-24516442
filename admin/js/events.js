// events.js - 管理端活动 CRUD
const API_BASE_URL = window.location.origin + '/api';

let allEvents = [];
let filteredEvents = [];
let categories = [];

document.addEventListener('DOMContentLoaded', initEvents);

async function initEvents() {
  if (!localStorage.getItem('adminLoggedIn')) location.href = 'login.html';
  await loadCategories();
  await loadEvents();
  setupFilters();
}

async function loadCategories() {
  const res = await fetch(`${API_BASE_URL}/categories`);
  categories = await res.json();
  const sel = document.getElementById('filterCategory');
  sel.innerHTML = '<option value="">All Categories</option>' +
    categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

async function loadEvents() {
  const res = await fetch(`${API_BASE_URL}/events`);
  allEvents = await res.json();
  filteredEvents = [...allEvents];
  displayEvents();
}

function setupFilters() {
  document.getElementById('eventSearchForm').addEventListener('submit', e => {
    e.preventDefault();
    applyFilters();
  });
}

function applyFilters() {
  const kw = document.getElementById('searchKeyword').value.trim().toLowerCase();
  const cat = document.getElementById('filterCategory').value;
  const st = document.getElementById('filterStatus').value;
  const dt = document.getElementById('filterDate').value;

  filteredEvents = allEvents.filter(ev => {
    if (kw && !ev.title.toLowerCase().includes(kw)) return false;
    if (cat && ev.category_id != cat) return false;
    if (st && ev.status !== st) return false;
    if (dt && ev.event_date !== dt) return false;
    return true;
  });
  displayEvents();
}

function resetFilters() {
  document.getElementById('eventSearchForm').reset();
  filteredEvents = [...allEvents];
  displayEvents();
}

function displayEvents() {
  const tbody = document.getElementById('eventsTableBody');
  if (!filteredEvents.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No events</td></tr>';
    return;
  }
  tbody.innerHTML = filteredEvents.map(ev => `
<tr>
  <td>${ev.title}</td>
  <td>${ev.event_date}</td>
  <td>${ev.location}</td>
  <td>${categories.find(c => c.id == ev.category_id)?.name || '—'}</td>
  <td><span class="status-${ev.status}">${ev.status}</span></td>
  <td>
    <button class="btn btn-warning btn-small" onclick="editEvent(${ev.id})">Edit</button>
    <button class="btn btn-danger btn-small" onclick="deleteEvent(${ev.id})">Delete</button>
  </td>
</tr>`).join('');
  document.getElementById('eventsStats').textContent = `${filteredEvents.length} events found`;
}

// ----- modal -----
function showCreateEventModal() {
  currentEvent = null;
  showEventModal('Create Event', buildEventForm());
}
function editEvent(id) {
  currentEvent = allEvents.find(ev => ev.id === id);
  showEventModal('Edit Event', buildEventForm(currentEvent));
}
function showEventModal(title, content) {
  const m = document.createElement('div');
  m.className = 'modal';
  m.innerHTML = `<div class="modal-content"><span class="close">&times;</span><h3>${title}</h3>${content}</div>`;
  document.body.appendChild(m);
  m.style.display = 'block';
  m.querySelector('.close').onclick = () => m.remove();
  window.onclick = e => e.target === m && m.remove();
  document.getElementById('eventForm').addEventListener('submit', handleEventSubmit);
}

function buildEventForm(ev = null) {
  const catOpts = categories.map(c => `<option value="${c.id}" ${ev && ev.category_id == c.id ? 'selected' : ''}>${c.name}</option>`).join('');
  return `
<form id="eventForm">
  <div class="form-group"><label>Title *</label><input name="title" value="${ev ? ev.title : ''}" required></div>
  <div class="form-group"><label>Description</label><textarea name="description" rows="3">${ev ? ev.description : ''}</textarea></div>
  <div class="form-group"><label>Date *</label><input type="date" name="event_date" value="${ev ? ev.event_date : ''}" required></div>
  <div class="form-group"><label>Location *</label><input name="location" value="${ev ? ev.location : ''}" required></div>
  <div class="form-group"><label>Category *</label><select name="category_id" required><option value="">Select</option>${catOpts}</select></div>
  <div class="form-group"><label>Status</label>
    <select name="status">
      <option value="Active" ${ev && ev.status === 'Active' ? 'selected' : ''}>Active</option>
      <option value="Past" ${ev && ev.status === 'Past' ? 'selected' : ''}>Past</option>
      <option value="Suspended" ${ev && ev.status === 'Suspended' ? 'selected' : ''}>Suspended</option>
    </select>
  </div>
  <div class="form-actions">
    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
    <button type="submit" class="btn btn-primary">${ev ? 'Update' : 'Create'}</button>
  </div>
</form>`;
}

async function handleEventSubmit(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = {
    title: fd.get('title'),
    description: fd.get('description'),
    event_date: fd.get('event_date'),
    location: fd.get('location'),
    category_id: fd.get('category_id'),
    status: fd.get('status')
  };
  const isEdit = !!currentEvent;
  const url = isEdit ? `${API_BASE_URL}/events/${currentEvent.id}` : `${API_BASE_URL}/events`;
  const method = isEdit ? 'PUT' : 'POST';
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  if (res.ok) {
    alert(isEdit ? 'Updated' : 'Created');
    document.querySelector('.modal').remove();
    await loadEvents();
  } else {
    alert(json.error || 'Save failed');
  }
}

async function deleteEvent(id) {
  if (!confirm('Delete this event?')) return;
  const res = await fetch(`${API_BASE_URL}/events/${id}`, { method: 'DELETE' });
  if (res.ok) {
    alert('Deleted');
    await loadEvents();
  } else {
    const j = await res.json();
    alert(j.error || 'Delete failed');
  }
}