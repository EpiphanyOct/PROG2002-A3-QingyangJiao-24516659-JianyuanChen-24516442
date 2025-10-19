// PROG2002 A3 - Admin Events Management  
const API_BASE_URL = window.location.origin + '/api';

/* ---------- utilities ---------- */
const formatDate = d => new Date(d).toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
});

const modal = (title, html) => {
  const m = document.getElementById('modal') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'modal', className: 'modal' }));
  m.innerHTML = `<div class="modal-content"><span class="close">&times;</span><h3>${title}</h3><div>${html}</div></div>`;
  m.style.display = 'block';
  m.querySelector('.close').onclick = () => m.style.display = 'none';
  window.onclick = e => e.target === m && (m.style.display = 'none');
};

/* ---------- state ---------- */
let allEvents = [];
let filteredEvents = [];
let categories = [];
let currentPage = 1;
const itemsPerPage = 10;
let currentEvent = null;

/* ---------- init ---------- */
document.addEventListener('DOMContentLoaded', initEventsPage);

async function initEventsPage() {
  checkLogin();
  try {
    await Promise.all([loadCategories(), loadEvents()]);
    setupSearchAndFilter();
  } catch (e) {
    showError('Initialization failed');
  }
}

function checkLogin() {
  if (!localStorage.getItem('adminLoggedIn')) location.href = 'login.html';
}

async function loadCategories() {
  const res = await fetch(`${API_BASE_URL}/categories`);
  const json = await res.json();
  if (json.success) categories = json.data;
}

async function loadEvents() {
  const res = await fetch(`${API_BASE_URL}/events`);
  const json = await res.json();
  if (json.success) {
    allEvents = json.data;
    filteredEvents = [...allEvents];
    displayEvents();
    updateStats();
  }
}

function setupSearchAndFilter() {
  const kw = document.getElementById('searchKeyword');
  const cat = document.getElementById('filterCategory');
  const st = document.getElementById('filterStatus');
  const dt = document.getElementById('filterDate');

  [kw, cat, st, dt].forEach(el => el.addEventListener('change', applyFilters));
  kw.addEventListener('input', () => (clearTimeout(window.searchTO), (window.searchTO = setTimeout(applyFilters, 500))));
}

function applyFilters() {
  const kw = document.getElementById('searchKeyword').value.trim().toLowerCase();
  const cat = document.getElementById('filterCategory').value;
  const st = document.getElementById('filterStatus').value;
  const dt = document.getElementById('filterDate').value;

  filteredEvents = allEvents.filter(ev => {
    if (kw && !(`${ev.event_name} ${ev.event_description}`.toLowerCase()).includes(kw)) return false;
    if (cat && ev.event_category != cat) return false;
    if (st && ev.event_status !== st) return false;
    if (dt && new Date(ev.event_date).toDateString() !== new Date(dt).toDateString()) return false;
    return true;
  });
  currentPage = 1;
  displayEvents();
  updateStats();
}

function resetFilters() {
  document.getElementById('searchKeyword').value = '';
  document.getElementById('filterCategory').value = '';
  document.getElementById('filterStatus').value = '';
  document.getElementById('filterDate').value = '';
  filteredEvents = [...allEvents];
  currentPage = 1;
  displayEvents();
  updateStats();
}

/* ---------- display ---------- */
function displayEvents() {
  const tbody = document.getElementById('eventsTableBody');
  if (!filteredEvents.length) {
    tbody.innerHTML = `
      <tr><td colspan="7" class="empty-state">
        <i class="fas fa-calendar-times"></i><h3>No Events</h3>
        <button class="btn btn-primary" onclick="showCreateEventModal()">Create Event</button>
      </td></tr>`;
    document.getElementById('pagination').style.display = 'none';
    return;
  }
  const start = (currentPage - 1) * itemsPerPage;
  tbody.innerHTML = filteredEvents.slice(start, start + itemsPerPage).map(createEventRow).join('');
  displayPagination();
}

function createEventRow(ev) {
  const isFree = ev.ticket_price == 0;
  const progress = ev.goal_amount > 0 ? Math.min(100, (ev.current_amount / ev.goal_amount) * 100) : 0;
  return `
<tr class="fade-in">
  <td>
    <div class="event-name">${ev.event_name}</div>
    <div class="event-category">${ev.category_name || 'Uncategorised'}</div>
  </td>
  <td><div class="event-date">${formatDate(ev.event_date)}</div></td>
  <td><div class="event-location">${ev.event_location}</div></td>
  <td><div class="event-category">${ev.category_name || 'Uncategorised'}</div></td>
  <td><span class="event-status status-${ev.event_status}">${getStatusText(ev.event_status)}</span></td>
  <td>
    <div>${ev.total_tickets_sold || 0} / ${ev.max_tickets}</div>
    ${ev.goal_amount ? `
    <div class="event-progress">
      <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
      <div class="progress-text">$${(ev.current_amount || 0).toLocaleString()} / $${(ev.goal_amount || 0).toLocaleString()}</div>
    </div>` : ''}
  </td>
  <td>
    <div class="event-actions">
      <button class="btn btn-primary btn-small" onclick="viewEvent(${ev.event_id})" title="View"><i class="fas fa-eye"></i></button>
      <button class="btn btn-warning btn-small" onclick="editEvent(${ev.event_id})" title="Edit"><i class="fas fa-edit"></i></button>
      <button class="btn btn-danger btn-small" onclick="deleteEvent(${ev.event_id})" title="Delete"><i class="fas fa-trash"></i></button>
    </div>
  </td>
</tr>`;
}

/* ---------- pagination ---------- */
function displayPagination() {
    const total = Math.ceil(filteredEvents.length / itemsPerPage);
    const pag = document.getElementById('pagination');
    const numbers = document.getElementById('pageNumbers');
    if (total <= 1) { pag.style.display = 'none'; return; }
    pag.style.display = 'flex';
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === total;
    numbers.innerHTML = Array.from({ length: total }, (_, i) => `
<button class="page-number ${i + 1 === currentPage ? 'active' : ''}" onclick="goPage(${i + 1})">${i + 1}</button>`).join('');
}

function changePage(dir) {
    const total = Math.ceil(filteredEvents.length / itemsPerPage);
    const page = currentPage + dir;
    if (page >= 1 && page <= total) goPage(page);
}

function goPage(page) {
    currentPage = page;
    displayEvents();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- modal ---------- */
function showCreateEventModal() {
    currentEvent = null;
    showEventModal('Create Event', createEventForm());
}

function editEvent(id) {
    currentEvent = allEvents.find(e => e.event_id === id);
    if (currentEvent) showEventModal('Edit Event', createEventForm(currentEvent));
}

function viewEvent(id) {
    currentEvent = allEvents.find(e => e.event_id === id);
    if (currentEvent) showEventModal('Event Details', createEventDetails(currentEvent));
}

async function deleteEvent(id) {
    const ev = allEvents.find(e => e.event_id === id);
    if (!ev) return;
    if (!confirm(`Delete event "${ev.event_name}"?`)) return;
    try {
        const res = await fetch(`${API_BASE_URL}/events/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
            showSuccessMessage('Deleted');
            await loadEvents();
        } else throw new Error(json.error);
    } catch (e) {
        showError(e.message);
    }
}

function showEventModal(title, content) {
    modal(title, content);
    document.getElementById('eventForm')?.addEventListener('submit', handleEventSubmit);
}

function createEventForm(ev = null) {
    const isEdit = !!ev;
    const catOpts = categories.map(c => `<option value="${c.category_id}" ${ev && ev.event_category == c.category_id ? 'selected' : ''}>${c.category_name}</option>`).join('');
    return `
<form id="eventForm">
    <div class="form-group"><label>Event Name *</label><input type="text" name="eventName" value="${ev ? ev.event_name : ''}" required></div>
    <div class="form-group"><label>DateTime *</label><input type="datetime-local" name="eventDate" value="${ev ? formatDateTimeLocal(ev.event_date) : ''}" required></div>
    <div class="form-group"><label>Location *</label><input type="text" name="eventLocation" value="${ev ? ev.event_location : ''}" required></div>
    <div class="form-group"><label>Category *</label><select name="eventCategory" required><option value="">Select</option>${catOpts}</select></div>
    <div class="form-group"><label>Ticket Price</label><input type="number" name="ticketPrice" min="0" step="0.01" value="${ev ? ev.ticket_price : 0}"></div>
    <div class="form-group"><label>Max Tickets *</label><input type="number" name="maxTickets" min="1" value="${ev ? ev.max_tickets : 100}" required></div>
    <div class="form-group"><label>Fundraising Goal</label><input type="number" name="goalAmount" min="0" step="0.01" value="${ev ? ev.goal_amount : 0}"></div>
    <div class="form-group"><label>Description</label><textarea name="eventDescription" rows="3">${ev ? ev.event_description : ''}</textarea></div>
    <div class="form-group"><label>Status</label>
        <select name="eventStatus"><option value="upcoming" ${ev && ev.event_status === 'upcoming' ? 'selected' : ''}>Upcoming</option><option value="past" ${ev && ev.event_status === 'past' ? 'selected' : ''}>Past</option><option value="suspended" ${ev && ev.event_status === 'suspended' ? 'selected' : ''}>Suspended</option></select>
    </div>
    <div class="form-actions"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Create'}</button></div>
</form>`;
}

function createEventDetails(ev) {
    const progress = ev.goal_amount > 0 ? Math.min(100, (ev.current_amount / ev.goal_amount) * 100) : 0;
    return `
<div class="event-card fade-in">
    ${createEventCard(ev)}
    <div style="padding:20px;border-top:1px solid #ecf0f1;">
        <h4>Participation Stats</h4>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;text-align:center;margin-top:10px;">
            <div><div style="font-size:1.5rem;font-weight:700;color:#3498db;">${ev.total_tickets_sold || 0}</div><div class="stat-label">Tickets Sold</div></div>
            <div><div style="font-size:1.5rem;font-weight:700;color:#27ae60;">${ev.registration_count || 0}</div><div class="stat-label">Registrations</div></div>
            <div><div style="font-size:1.5rem;font-weight:700;color:#f39c12;">${progress.toFixed(1)}%</div><div class="stat-label">Progress</div></div>
        </div>
        <div class="form-actions" style="margin-top:20px;">
            <button class="btn btn-warning" onclick="editEvent(${ev.event_id})"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn btn-danger" onclick="deleteEvent(${ev.event_id})"><i class="fas fa-trash"></i> Delete</button>
        </div>
    </div>
</div>`;
}

async function handleEventSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    try {
        const fd = new FormData(e.target);
        const payload = {
            event_name: fd.get('eventName').trim(),
            event_description: fd.get('eventDescription')?.trim() || null,
            event_date: fd.get('eventDate'),
            event_location: fd.get('eventLocation').trim(),
            event_category: fd.get('eventCategory') || null,
            ticket_price: parseFloat(fd.get('ticketPrice')) || 0,
            max_tickets: parseInt(fd.get('maxTickets')),
            goal_amount: parseFloat(fd.get('goalAmount')) || 0,
            event_status: fd.get('eventStatus')
        };
        if (!payload.event_name || !payload.event_date || !payload.event_location) {
            showError('Required fields missing'); return;
        }
        const isEdit = !!currentEvent;
        const url = isEdit ? `${API_BASE_URL}/events/${currentEvent.event_id}` : `${API_BASE_URL}/events`;
        const method = isEdit ? 'PUT' : 'POST';
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const json = await res.json();
        if (json.success) {
            showSuccessMessage(isEdit ? 'Updated' : 'Created');
            closeModal();
            await loadEvents();
        } else throw new Error(json.error || 'Save failed');
    } catch (e) {
        showError(e.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = currentEvent ? 'Update' : 'Create';
    }
}

/* ---------- utils ---------- */
function updateStats() {
    const total = filteredEvents.length;
    const upcoming = filteredEvents.filter(e => e.event_status === 'upcoming').length;
    const past = filteredEvents.filter(e => e.event_status === 'past').length;
    document.getElementById('eventsStats').textContent = `${total} events found (Upcoming: ${upcoming}, Past: ${past})`;
}

function getStatusText(status) {
    const map = { upcoming: 'Upcoming', past: 'Past', suspended: 'Suspended' };
    return map[status] || status;
}

function showError(msg) {
    const err = document.createElement('div');
    err.style.cssText = 'position:fixed;top:100px;left:50%;transform:translateX(-50%);background:#e74c3c;color:#fff;padding:15px 25px;border-radius:8px;z-index:1000;box-shadow:0 5px 15px rgba(0,0,0,.2);';
    err.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${msg}`;
    document.body.appendChild(err);
    setTimeout(() => err.remove(), 5000);
}

function showSuccessMessage(msg) {
    const succ = document.createElement('div');
    succ.style.cssText = 'position:fixed;top:100px;left:50%;transform:translateX(-50%);background:#27ae60;color:#fff;padding:15px 25px;border-radius:8px;z-index:1000;box-shadow:0 5px 15px rgba(0,0,0,.2);';
    succ.innerHTML = `<i class="fas fa-check-circle"></i> ${msg}`;
    document.body.appendChild(succ);
    setTimeout(() => succ.remove(), 3000);
}

function logout() {
    if (confirm('Logout?')) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        location.href = 'login.html';
    }
}