// PROG2002 A3 - Client Side  (main.js 首页)
const API_BASE_URL = window.location.origin + '/api';

const formatDate = d => new Date(d).toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
});
const getStatusText = s => ({upcoming: '即将开始', past: '已结束', suspended: '已暂停'}[s] || s);

// 工具：loading
const showLoading = id => document.getElementById(id).innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>加载中...</p></div>';
const showError = (msg, id) => (document.getElementById(id).innerHTML = `<div class="error-message"><i class="fas fa-exclamation-triangle"></i> ${msg}</div>`);

// 统一卡片（同作业A）
const createEventCard = ev => {
  const progress = ev.goal_amount > 0 ? Math.min(100, (ev.current_amount / ev.goal_amount) * 100) : 0;
  const isFree = ev.ticket_price === 0;
  return `
<div class="event-card fade-in" data-id="${ev.event_id}">
  <div class="event-header">
    <h3>${ev.event_name}</h3>
    <span class="event-category">${ev.category_name}</span>
  </div>
  <div class="event-details">
    <div class="event-meta">
      <div class="event-date"><i class="icon-calendar"></i>${formatDate(ev.event_date)}</div>
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
    <a href="event-detail.html?id=${ev.event_id}" class="event-link">View Details</a>
  </div>
</div>`;
};

// 初始化首页
document.addEventListener('DOMContentLoaded', () => loadUpcomingEvents());

async function loadUpcomingEvents() {
  showLoading('events-container');
  try {
    const res = await fetch(`${API_BASE_URL}/events`);
    const json = await res.json();
    const container = document.getElementById('events-container');
    if (!json.success || !json.data.length) {
      container.innerHTML = '<p class="no-events">No upcoming events at this time.</p>';
      return;
    }
    container.innerHTML = json.data.map(createEventCard).join('');
  } catch (err) {
    showError('Failed to load events.', 'events-container');
  }
}