// PROG2002 A3 - Search Page  (search.js)
const API_BASE_URL = window.location.origin + '/api';

const formatDate = d => new Date(d).toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
});

let allEvents = [], filteredEvents = [], curPage = 1, perPage = 9;

document.addEventListener('DOMContentLoaded', initSearch);

async function initSearch() {
  try {
    const [evRes, catRes] = await Promise.all([
      fetch(`${API_BASE_URL}/events`).then(r => r.json()),
      fetch(`${API_BASE_URL}/categories`).then(r => r.json())
    ]);
    allEvents = evRes.data || [];
    filteredEvents = [...allEvents];
    const catSel = document.getElementById('searchCategory');
    catSel.innerHTML = '<option value="">All categories</option>' + (catRes.data || []).map(c => `<option value="${c.category_id}">${c.category_name}</option>`).join('');
    document.getElementById('event-search-form').addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const kw = fd.get('name')?.toLowerCase() || '';
      const cat = fd.get('category');
      const loc = fd.get('location')?.toLowerCase() || '';
      filteredEvents = allEvents.filter(ev => {
        if (kw && !(`${ev.event_name} ${ev.event_description}`.toLowerCase()).includes(kw)) return false;
        if (cat && ev.event_category != cat) return false;
        if (loc && !ev.event_location.toLowerCase().includes(loc)) return false;
        return true;
      });
      curPage = 1;
      display();
    });
    display();
  } catch (e) {
    document.getElementById('search-results').innerHTML = '<p class="error">Failed to load events.</p>';
  }
}

function display() {
  const ctr = document.getElementById('search-results');
  const total = Math.ceil(filteredEvents.length / perPage);
  const start = (curPage - 1) * perPage;
  ctr.innerHTML = '<div class="events-grid">' + filteredEvents.slice(start, start + perPage).map(ev => createEventCard(ev, document.getElementById('searchName')?.value || '')).join('') + '</div>';
  ctr.querySelectorAll('.event-card').forEach(card => card.onclick = () => location.href = `event-detail.html?id=${card.dataset.id}`);
  document.getElementById('pagination').style.display = total <= 1 ? 'none' : 'flex';
  document.getElementById('resultCount').textContent = filteredEvents.length;
}

// Paging assistance
window.goToPage = p => { curPage = p; display(); window.scrollTo({top: 0, behavior: 'smooth'}); };