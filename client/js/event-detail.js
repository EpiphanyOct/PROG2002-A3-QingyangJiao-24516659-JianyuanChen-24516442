// event-detail.js
const API_BASE_URL = window.location.origin + '/api';

const formatDate = d => new Date(d).toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
});

const statusText = {
  Active: 'Upcoming',
  Past: 'Ended',
  Suspended: 'Suspended'
};

document.addEventListener('DOMContentLoaded', () => loadEventDetail());

async function loadEventDetail() {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) return showError('No event ID provided.');
  const container = document.getElementById('event-detail-container');
  container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading event...</div>';
  try {
    const res = await fetch(`${API_BASE_URL}/events/${id}`);
    const ev = await res.json();
    container.innerHTML = createEventDetail(ev);
  } catch (e) {
    container.innerHTML = '<p class="error">Failed to load event details.</p>';
  }
}

function createEventDetail(ev) {
  const progress = ev.goal_amount > 0 ? Math.min(100, (ev.current_amount / ev.goal_amount) * 100) : 0;
  const isFree = ev.ticket_price == 0;
  return `
<div class="event-detail-card">
  <div class="event-header">
    <h2>${ev.title}</h2>
    <span class="event-category">${ev.category_name || 'Uncategorised'}</span>
  </div>
  <div class="event-meta">
    <div><i class="fas fa-calendar"></i> ${formatDate(ev.event_date)}</div>
    <div><i class="fas fa-map-marker-alt"></i> ${ev.location}</div>
    <div><i class="fas fa-ticket"></i> ${isFree ? 'Free' : `$${ev.ticket_price}`}</div>
    <div><i class="fas fa-info-circle"></i> Status: ${statusText[ev.status] || ev.status}</div>
  </div>
  <p class="event-description">${ev.description}</p>
  <div class="event-progress">
    <span class="progress-label">Raised: $${ev.current_amount} of $${ev.goal_amount}</span>
    <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
  </div>
  <div class="event-actions">
    <a href="registration.html?id=${ev.id}" class="btn btn-primary">Register Now</a>
    <a href="search.html" class="btn btn-secondary">Back to Search</a>
  </div>
</div>`;
}