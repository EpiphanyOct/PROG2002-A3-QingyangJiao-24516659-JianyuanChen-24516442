// PROG2002 A3 - Registration Page (registration.js)

/* ---------- 1. Basic configuration ---------- */
const API_BASE_URL = window.location.origin + '/api';

/* ---------- 2. Tool function ---------- */
const formatDate = d => new Date(d).toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
});

const modal = (title, html) => {
  const m = document.getElementById('modal') || document.body.appendChild(Object.assign(document.createElement('div'), {id: 'modal', className: 'modal'}));
  m.innerHTML = `<div class="modal-content"><span class="close">&times;</span><h3>${title}</h3><div>${html}</div></div>`;
  m.style.display = 'block';
  m.querySelector('.close').onclick = () => m.style.display = 'none';
};

/* ---------- 3. State variables ---------- */
let currentEvent = null;
let eventId = null;

/* ----------4.initialization ---------- */
document.addEventListener('DOMContentLoaded', initRegistration);

async function initRegistration() {
  eventId = new URLSearchParams(location.search).get('id');
  if (!eventId) return modal('Error', 'No event ID'), setTimeout(() => location.href = 'search.html', 1500);

  try {
    const res = await fetch(`${API_BASE_URL}/events/${eventId}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Event not found');
    currentEvent = json.data;

    renderEventInfo();
    setupTicketSelect();
    setupFormValidation();
  } catch (e) {
    modal('Load failed', e.message);
  }
}

/* ----------5. Render the event card ---------- */
function renderEventInfo() {
  const isFree = currentEvent.ticket_price === 0;
  const progress = currentEvent.goal_amount > 0 ? Math.min(100, (currentEvent.current_amount / currentEvent.goal_amount) * 100) : 0;

  document.getElementById('eventInfo').innerHTML = createEventCard(currentEvent) +
    `<div class="registration-area">
       <h3>Registration</h3>
       <form id="regForm" class="form-stacked">
         <div class="form-group">
           <label>Name *</label>
           <input type="text" name="userName" required>
         </div>
         <div class="form-group">
           <label>Email *</label>
           <input type="email" name="userEmail" required>
         </div>
         <div class="form-group">
           <label>Phone</label>
           <input type="tel" name="userPhone">
         </div>
         <div class="form-group">
           <label>Tickets *</label>
           <select name="ticketCount" required>
             ${[...Array(Math.min(5, currentEvent.max_tickets - currentEvent.total_tickets_sold)).keys()]
               .map(i => `<option value="${i+1}">${i+1} ${currentEvent.ticket_price > 0 ? `($${currentEvent.ticket_price*(i+1)})` : '(Free)'}</option>`).join('')}
           </select>
         </div>
         <div class="form-actions">
           <button type="button" class="btn btn-secondary" onclick="history.back()">Cancel</button>
           <button type="submit" class="btn btn-primary">Confirm</button>
         </div>
       </form>
     </div>`;
}

/* ---------- 6. Vote Selection & Subtotal ---------- */
function setupTicketSelect() {
  const sel = document.getElementById('ticketCount');
  if (!sel) return; 
  sel.addEventListener('change', () => {
    const n = +sel.value;
    const t = n * currentEvent.ticket_price;
    const sum = document.getElementById('ticketSummary');
    if (!sum) return;
    sum.style.display = n ? 'block' : 'none';
    document.getElementById('selectedTickets').textContent = n;
    document.getElementById('totalPrice').textContent = t > 0 ? `$${t}` : 'Free';
  });
}

/* ---------- 7. Form submission ---------- */
function setupFormValidation() {
  document.getElementById('regForm').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {
      event_id: +eventId,
      user_name: fd.get('userName').trim(),
      user_email: fd.get('userEmail').trim(),
      user_phone: fd.get('userPhone')?.trim() || null,
      ticket_count: +fd.get('ticketCount')
    };
    if (!payload.ticket_count) return modal('Form error', 'Please select ticket quantity');

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    try {
      const res = await fetch(`${API_BASE_URL}/registrations`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)});
      const json = await res.json();
      if (json.success) {
        modal('Success', `
          <div style="text-align:center">
            <p>Confirmation email sent to <strong>${payload.user_email}</strong></p>
            <button onclick="location.href='index.html'" class="btn btn-primary">Back Home</button>
          </div>`);
      } else throw new Error(json.error || 'Registration failed');
    } catch (err) {
      modal('Failed', err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Confirm';
    }
  });
}

const createEventCard = ev => {
  const progress = ev.goal_amount > 0 ? Math.min(100, (ev.current_amount / ev.goal_amount) * 100) : 0;
  const isFree = ev.ticket_price === 0;
  const date = formatDate(ev.event_date);
  return `
<div class="event-card fade-in" data-id="${ev.event_id}">
  <div class="event-header">
    <h3>${ev.event_name}</h3>
    <span class="event-category">${ev.category_name}</span>
  </div>
  <div class="event-details">
    <div class="event-meta">
      <div class="event-date"><i class="icon-calendar"></i>${date}</div>
      <div class="event-location"><i class="icon-location"></i>${ev.event_location}</div>
      <div class="event-price"><i class="icon-ticket"></i>${isFree ? 'Free' : `$${ev.ticket_price}`}</div>
    </div>
    <p class="event-description">${ev.event_description?.substring(0, 120)}...</p>
  </div>
  <div class="event-footer">
    <div class="event-progress">
      <span class="progress-label">Raised: $${ev.current_amount} of $${ev.goal_amount}</span>
      <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
    </div>
  </div>
</div>`;
};