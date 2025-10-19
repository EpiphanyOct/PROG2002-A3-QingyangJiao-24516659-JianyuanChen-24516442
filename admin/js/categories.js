// PROG2002 A3 - Admin Category Management
const API_BASE_URL = window.location.origin + '/api';

let categories = [];
let events = [];

/* ---------- utilities (same as main.js) ---------- */
const formatDate = d => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
const modal = (title, html) => {
    const m = document.getElementById('modal') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'modal', className: 'modal' }));
    m.innerHTML = `<div class="modal-content"><span class="close">&times;</span><h3>${title}</h3><div>${html}</div></div>`;
    m.style.display = 'block';
    m.querySelector('.close').onclick = () => m.style.display = 'none';
    window.onclick = e => e.target === m && (m.style.display = 'none');
};

/* ---------- init ---------- */
document.addEventListener('DOMContentLoaded', initCategoriesPage);

async function initCategoriesPage() {
    checkLoginStatus();
    try {
        await Promise.all([loadCategories(), loadEvents()]);
        calculateStats();
        displayCategories();
    } catch (e) {
        showError('Initialization failed');
    }
}

function checkLoginStatus() {
    if (!localStorage.getItem('adminLoggedIn')) location.href = 'login.html';
}

async function loadCategories() {
    const res = await fetch(`${API_BASE_URL}/categories/stats/overview`);
    const json = await res.json();
    if (json.success) categories = json.data;
}

async function loadEvents() {
    const res = await fetch(`${API_BASE_URL}/events`);
    const json = await res.json();
    if (json.success) events = json.data;
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
    grid.innerHTML = categories.map(createCategoryCard).join('');
}

function createCategoryCard(cat) {
    const catEvents = events.filter(e => e.event_category == cat.category_id);
    const eventCount = catEvents.length;
    return `
<div class="event-card fade-in" data-category-id="${cat.category_id}">
    <div class="event-header">
        <h3>${cat.category_name}</h3>
        <span class="event-category">${eventCount} events</span>
    </div>
    <div class="event-details">
        <p class="event-description">${cat.category_description || 'No description'}</p>
        <div class="event-meta">
            <div class="event-date"><i class="fas fa-calendar"></i>${formatDate(cat.created_at)}</div>
        </div>
    </div>
    <div class="event-footer">
        <div class="event-actions">
            <button class="btn btn-warning btn-small" onclick="editCategory(${cat.category_id})"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn btn-danger btn-small" onclick="deleteCategory(${cat.category_id})"><i class="fas fa-trash"></i> Delete</button>
        </div>
    </div>
</div>`;
}

/* ---------- modal ---------- */
function showCreateCategoryModal() {
    currentCategory = null;
    showCategoryModal('Create Category', createCategoryForm());
}

function editCategory(id) {
    currentCategory = categories.find(c => c.category_id === id);
    if (currentCategory) showCategoryModal('Edit Category', createCategoryForm(currentCategory));
}

function showCategoryModal(title, content) {
    modal(title, content);
    document.getElementById('categoryForm').addEventListener('submit', handleCategorySubmit);
}

function createCategoryForm(cat = null) {
    return `
<form id="categoryForm">
    <div class="form-group">
        <label>Category Name *</label>
        <input type="text" name="categoryName" value="${cat ? cat.category_name : ''}" required>
    </div>
    <div class="form-group">
        <label>Description</label>
        <textarea name="categoryDescription" rows="3">${cat ? cat.category_description : ''}</textarea>
    </div>
    <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">${cat ? 'Update' : 'Create'}</button>
    </div>
</form>`;
}

async function handleCategorySubmit(e) {
    e.preventDefault();
    const data = {
        category_name: e.target.categoryName.value.trim(),
        category_description: e.target.categoryDescription.value.trim()
    };
    if (!data.category_name) return showError('Category name is required');

    const isEdit = !!currentCategory;
    const url = isEdit ? `${API_BASE_URL}/categories/${currentCategory.category_id}` : `${API_BASE_URL}/categories`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const json = await res.json();
        if (json.success) {
            showSuccessMessage(isEdit ? 'Updated' : 'Created');
            closeModal();
            await loadCategories();
            calculateStats();
            displayCategories();
        } else throw new Error(json.error);
    } catch (e) {
        showError(e.message);
    }
}

async function deleteCategory(id) {
    const cat = categories.find(c => c.category_id === id);
    if (!cat) return;
    const used = events.some(e => e.event_category == id);
    if (used) return showError('Cannot delete – category contains events');
    if (!confirm(`Delete category "${cat.category_name}"?`)) return;

    try {
        const res = await fetch(`${API_BASE_URL}/categories/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
            showSuccessMessage('Deleted');
            await loadCategories();
            calculateStats();
            displayCategories();
        } else throw new Error(json.error);
    } catch (e) {
        showError(e.message);
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
        localStorage.removeItem('adminUsername');
        location.href = 'login.html';
    }
}