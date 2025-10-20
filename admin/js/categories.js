// categories.js - 管理端分类管理
const API_BASE_URL = window.location.origin + '/api';

let categories = [];
let events = [];

document.addEventListener('DOMContentLoaded', initCategoriesPage);

async function initCategoriesPage() {
  if (!localStorage.getItem('adminLoggedIn')) location.href = 'login.html';
  try {
    await Promise.all([loadCategories(), loadEvents()]);
    calculateStats();
    displayCategories();
  } catch (e) {
    showError('Initialization failed');
  }
}

async function loadCategories() {
  const res = await fetch(`${API_BASE_URL}/categories`);
  categories = await res.json();
}

async function loadEvents() {
  const res = await fetch(`${API_BASE_URL}/events`);
  events = await res.json();
}

function calculateStats() {
  const totalCat = categories.length;
  const totalEvt = events.length;
  const avg = totalCat ? (totalEvt / totalCat).toFixed(1) : 0;
  document.getElementById('totalCategories').textContent = totalCat;
  document.getElementById('totalEvents').textContent = totalEvt;
  document.getElementById('avgEventsPerCategory').textContent = avg;
}

function displayCategories() {
  const grid = document.getElementById('categoriesGrid');
  if (!categories.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <i class="fas fa-tags"></i><h3>No Categories</h3>
        <button class="btn btn-primary" onclick="showCreateCategoryModal()">Create Category</button>
      </div>`;
    return;
  }
  grid.innerHTML = categories.map(cat => {
    const catEvents = events.filter(e => e.category_id == cat.id);
    return `
<div class="event-card fade-in" data-category-id="${cat.id}">
  <div class="event-header">
    <h3>${cat.name}</h3>
    <span class="event-category">${catEvents.length} events</span>
  </div>
  <div class="event-details">
    <p class="event-description">${cat.description || 'No description'}</p>
  </div>
  <div class="event-footer">
    <div class="event-actions">
      <button class="btn btn-warning btn-small" onclick="editCategory(${cat.id})">Edit</button>
      <button class="btn btn-danger btn-small" onclick="deleteCategory(${cat.id})">Delete</button>
    </div>
  </div>
</div>`;
  }).join('');
}

// ----- modal -----
function showCreateCategoryModal() {
  currentCategory = null;
  showCategoryModal('Create Category', createCategoryForm());
}
function editCategory(id) {
  currentCategory = categories.find(c => c.id === id);
  showCategoryModal('Edit Category', createCategoryForm(currentCategory));
}
function showCategoryModal(title, content) {
  const m = document.createElement('div');
  m.className = 'modal';
  m.innerHTML = `<div class="modal-content"><span class="close">&times;</span><h3>${title}</h3>${content}</div>`;
  document.body.appendChild(m);
  m.style.display = 'block';
  m.querySelector('.close').onclick = () => m.remove();
  window.onclick = e => e.target === m && m.remove();
  document.getElementById('categoryForm').addEventListener('submit', handleCategorySubmit);
}

function createCategoryForm(cat = null) {
  return `
<form id="categoryForm">
  <div class="form-group"><label>Category Name *</label><input name="categoryName" value="${cat ? cat.name : ''}" required></div>
  <div class="form-group"><label>Description</label><textarea name="categoryDescription" rows="3">${cat ? cat.description : ''}</textarea></div>
  <div class="form-actions">
    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
    <button type="submit" class="btn btn-primary">${cat ? 'Update' : 'Create'}</button>
  </div>
</form>`;
}

async function handleCategorySubmit(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = {
    name: fd.get('categoryName'),
    description: fd.get('categoryDescription')
  };
  const isEdit = !!currentCategory;
  const url = isEdit ? `${API_BASE_URL}/categories/${currentCategory.id}` : `${API_BASE_URL}/categories`;
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
    await loadCategories();
    calculateStats();
    displayCategories();
  } else {
    alert(json.error || 'Save failed');
  }
}

async function deleteCategory(id) {
  const cat = categories.find(c => c.id === id);
  if (!cat) return;
  const used = events.some(e => e.category_id == id);
  if (used) return alert('Cannot delete – category contains events');
  if (!confirm(`Delete category "${cat.name}"?`)) return;

  const res = await fetch(`${API_BASE_URL}/categories/${id}`, { method: 'DELETE' });
  if (res.ok) {
    alert('Deleted');
    await loadCategories();
    calculateStats();
    displayCategories();
  } else {
    alert(json.error || 'Delete failed');
  }
}

function showError(msg) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'position:fixed;top:100px;left:50%;transform:translateX(-50%);background:#e74c3c;color:#fff;padding:15px 25px;border-radius:8px;z-index:1000;box-shadow:0 5px 15px rgba(0,0,0,.2);';
  errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${msg}`;
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccessMessage(msg) {
  const successDiv = document.createElement('div');
  successDiv.style.cssText = 'position:fixed;top:100px;left:50%;transform:translateX(-50%);background:#27ae60;color:#fff;padding:15px 25px;border-radius:8px;z-index:1000;box-shadow:0 5px 15px rgba(0,0,0,.2);';
  successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${msg}`;
  document.body.appendChild(successDiv);
  setTimeout(() => successDiv.remove(), 3000);
}

function logout() {
  if (confirm('Logout?')) {
    localStorage.removeItem('adminLoggedIn');
    location.href = 'login.html';
  }
}