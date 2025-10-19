// PROG2002 A3 - Registration Page  (registration.js)
const API_BASE_URL = window.location.origin + '/api';

const formatDate = d => new Date(d).toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
});

const modal = (title, html) => {
  const m = document.getElementById('modal') || document.body.appendChild(Object.assign(document.createElement('div'), {id: 'modal', className: 'modal'}));
  m.innerHTML = `<div class="modal-content"><span class="close">&times;</span><h3>${title}</h3><div>${html}</div></div>`;
  m.style.display = 'block';
  m.querySelector('.close').onclick = () => m.style.display = 'none';
};

let currentEvent = null, eventId = null;

document.addEventListener('DOMContentLoaded', initRegistration);

async function initRegistration() {
  eventId = new URLSearchParams(location.search).get('id');
  if (!eventId) return modal('错误', '缺少事件ID'), setTimeout(() => location.href = 'search.html', 1500);
  try {
    const res = await fetch(`${API_BASE_URL}/events/${eventId}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || '事件不存在');
    currentEvent = json.data;
    renderEventInfo();
    setupTicketSelect();
    setupFormValidation();
  } catch (e) {
    modal('加载失败', e.message);
  }
}

function renderEventInfo() {
  const isFree = currentEvent.ticket_price === 0;
  const progress = currentEvent.goal_amount > 0 ? Math.min(100, (currentEvent.current_amount / currentEvent.goal_amount) * 100) : 0;
  document.getElementById('eventInfo').innerHTML = `
<div class="event-info-card">
  <h1>${currentEvent.event_name}</h1>
  <div class="event-meta-detailed">
    <div class="meta-item"><i class="fas fa-calendar"></i>${formatDate(currentEvent.event_date)}</div>
    <div class="meta-item"><i class="fas fa-map-marker-alt"></i>${currentEvent.event_location}</div>
    <div class="meta-item"><i class="fas fa-tag"></i>${currentEvent.category_name}</div>
  </div>
  <div class="event-price-display">
    <div class="price-label">票价:</div>
    <div class="price-value ${isFree ? 'free' : ''}">${isFree ? 'Free' : `$${currentEvent.ticket_price}`}</div>
  </div>
  ${currentEvent.goal_amount > 0 ? `
  <div class="event-progress-detailed">
    <div class="progress-bar-large"><div class="progress-fill-large" style="width:${progress}%"></div></div>
    <div class="progress-info">${progress.toFixed(1)}% &nbsp; $${currentEvent.current_amount.toLocaleString()} / $${currentEvent.goal_amount.toLocaleString()}</div>
  </div>` : ''}
  <div class="event-description-detailed"><h3>事件描述</h3><p>${currentEvent.event_description}</p></div>
</div>`;
}

function setupTicketSelect() {
  const sel = document.getElementById('ticketCount');
  const avail = currentEvent.max_tickets - currentEvent.total_tickets_sold;
  for (let i = 1; i <= Math.min(5, avail); i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${i} 张票 ${currentEvent.ticket_price > 0 ? `($${currentEvent.ticket_price * i})` : '(Free)'}`;
    sel.appendChild(opt);
  }
  sel.onchange = () => {
    const n = +sel.value;
    const t = n * currentEvent.ticket_price;
    const sum = document.getElementById('ticketSummary');
    sum.style.display = n ? 'block' : 'none';
    document.getElementById('selectedTickets').textContent = n;
    document.getElementById('totalPrice').textContent = t > 0 ? `$${t}` : 'Free';
  };
}

function setupFormValidation() {
  document.getElementById('registrationForm').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {
      event_id: +eventId,
      user_name: fd.get('userName').trim(),
      user_email: fd.get('userEmail').trim(),
      user_phone: fd.get('userPhone')?.trim() || null,
      ticket_count: +fd.get('ticketCount')
    };
    if (!payload.ticket_count) return modal('表单错误', '请选择票数');
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 处理中...';
    try {
      const res = await fetch(`${API_BASE_URL}/registrations`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)});
      const json = await res.json();
      if (json.success) {
        modal('注册成功', `
<div style="text-align:center">
  <p>确认邮件已发送至 <strong>${payload.user_email}</strong></p>
  <button onclick="location.href='index.html'" class="btn btn-primary">返回首页</button>
</div>`);
      } else throw new Error(json.error || '注册失败');
    } catch (err) {
      modal('失败', err.message);
    } finally {
      btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i> 提交注册';
    }
  });
}