// search.js
const API_BASE_URL = window.location.origin + '/api';

let allEvents = [], filteredEvents = [];

document.addEventListener('DOMContentLoaded', initSearch);

async function initSearch() {
  try {
    const [evRes, catRes] = await Promise.all([
      fetch(`${API_BASE_URL}/events`),
      fetch(`${API_BASE_URL}/categories`)
    ]);
    allEvents = await evRes.json();
    const categories = await catRes.json();
    const catSel = document.getElementById('category');
    catSel.innerHTML = '<option value="">All Categories</option>' +
      categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    document.getElementById('searchForm').addEventListener('submit', e => {
      e.preventDefault();
      applyFilters();
    });
    displayEvents();
  } catch (e) {
    document.getElementById('search-results').innerHTML = '<p class="error">Failed to load data.</p>';
  }
}

// 1. 阻止空参数进查询串
function applyFilters() {
  const title = document.getElementById('name').value.trim();
  const catId = document.getElementById('category').value.trim();
  const loc   = document.getElementById('location').value.trim();
  const date  = document.getElementById('date').value;

  const q = new URLSearchParams();
  if (title) q.append('name', title);
  if (catId) q.append('category_id', catId);
  if (loc)   q.append('location', loc);
  if (date)  q.append('event_date', date);

  // 一个条件都没填 → 直接显示全部，不再请求
  if (!q.toString()) {
    filteredEvents = [...allEvents];
    displayEvents();
    return;
  }

  fetch(`${API_BASE_URL}/events/search?` + q)
    .then(r => r.json())
    .then(list => {
      filteredEvents = list;
      displayEvents();
    });
}

// 2. Clear 按钮恢复初始状态
function resetFilters() {
  document.getElementById('searchForm').reset();
  filteredEvents = [...allEvents];   // 还原全量
  displayEvents();
}

function displayEvents() {
  const ctr = document.getElementById('search-results');
  const stats = document.getElementById('resultStats');
  stats.textContent = `${filteredEvents.length} events found`;
  if (!filteredEvents.length) {
    ctr.innerHTML = '<p class="empty-state">No events match your criteria.</p>';
    return;
  }
  ctr.innerHTML = filteredEvents.map(ev => createEventCard(ev)).join('');
  ctr.querySelectorAll('.event-card').forEach(card => {
    card.addEventListener('click', () => location.href = `event.html?id=${card.dataset.id}`);
  });
}

const createEventCard = ev => {
  const progress = ev.goal_amount > 0 ? Math.min(100, (ev.current_amount / ev.goal_amount) * 100) : 0;
  const isFree = ev.ticket_price == 0;
  return `
<div class="event-card" data-id="${ev.id}">
  <div class="event-header">
    <h3>${ev.title}</h3>
    <span class="event-category">${ev.category_name || 'Uncategorised'}</span>
  </div>
  <div class="event-details">
    <div class="event-meta">
      <div class="event-date"><i class="fas fa-calendar"></i>${new Date(ev.event_date).toLocaleDateString()}</div>
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
  </div>
</div>`;
};