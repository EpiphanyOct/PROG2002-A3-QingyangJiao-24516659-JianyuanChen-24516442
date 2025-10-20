// main.js - 首页加载活动
const API_BASE_URL = window.location.origin + '/api';

const formatDate = d => new Date(d).toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric'
});

const statusText = {
  Active: 'Upcoming',
  Past: 'Ended',
  Suspended: 'Suspended'
};

const createEventCard = ev => {
  const progress = ev.goal_amount > 0 ? Math.min(100, (ev.current_amount / ev.goal_amount) * 100) : 0;
  const isFree = ev.ticket_price == 0;
  return `
<div class="event-card fade-in" data-id="${ev.id}">
  <div class="event-header">
    <h3>${ev.title}</h3>
    <span class="event-category">${ev.category_name || 'Uncategorised'}</span>
  </div>
  <div class="event-details">
    <div class="event-meta">
      <div class="event-date"><i class="fas fa-calendar"></i>${formatDate(ev.event_date)}</div>
      <div class="event-location"><i class="fas fa-map-marker-alt"></i>${ev.location}</div>
      <div class="event-price"><i class="fas fa-ticket"></i>${isFree ? 'Free' : `$${ev.ticket_price}`}</div>
    </div>
    <p class="event-description">${ev.description?.substring(0, 120)}...</p>
  </div>
  <div class="event-footer">
    <div class="event-progress">
      <span class="progress-label">Raised: $${ev.current_amount} of $${ev.goal_amount}</span>
      <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
    </div>
    <a href="event.html?id=${ev.id}" class="btn btn-primary">View Details</a>
  </div>
</div>`;
};

document.addEventListener('DOMContentLoaded', () => loadUpcomingEvents());

async function loadUpcomingEvents() {
  const container = document.getElementById('events-container');
  container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading events...</div>';
  try {
    const res = await fetch(`${API_BASE_URL}/events`);
    const list = await res.json();
    if (!list.length) {
      container.innerHTML = '<p class="empty-state">No upcoming events at this time.</p>';
      return;
    }
    container.innerHTML = list.map(createEventCard).join('');
  } catch (e) {
    container.innerHTML = '<p class="error">Failed to load events.</p>';
  }
}