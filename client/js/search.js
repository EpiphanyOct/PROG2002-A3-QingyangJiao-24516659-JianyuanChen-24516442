// PROG2002 A3 - Search Page JavaScript
// 搜索页面功能

const API_BASE_URL = window.location.origin + '/api';

// 全局变量
let allEvents = [];
let filteredEvents = [];
let categories = [];
let currentPage = 1;
let itemsPerPage = 9;
let currentView = 'grid';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeSearchPage();
});

// 初始化搜索页面
async function initializeSearchPage() {
    try {
        // 并行加载分类和事件数据
        await Promise.all([
            loadCategories(),
            loadAllEvents()
        ]);
        
        // 设置搜索表单事件
        setupSearchForm();
        
        // 检查URL参数
        checkURLParams();
        
        console.log('✅ 搜索页面初始化完成');
    } catch (error) {
        console.error('❌ 搜索页面初始化失败:', error);
        showError('页面初始化失败，请刷新重试');
    }
}

// 加载分类数据
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const result = await response.json();
        
        if (result.success) {
            categories = result.data;
            populateCategorySelect();
        }
    } catch (error) {
        console.error('加载分类失败:', error);
    }
}

// 填充分类选择框
function populateCategorySelect() {
    const select = document.getElementById('searchCategory');
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.category_id;
        option.textContent = `${category.category_name} (${category.event_count || 0})`;
        select.appendChild(option);
    });
}

// 加载所有事件
async function loadAllEvents() {
    try {
        const response = await fetch(`${API_BASE_URL}/events`);
        const result = await response.json();
        
        if (result.success) {
            allEvents = result.data;
            filteredEvents = [...allEvents];
            
            // 初始显示所有事件
            displayResults();
            updateResultCount();
        }
    } catch (error) {
        console.error('加载事件失败:', error);
        showError('加载事件失败，请刷新重试');
    }
}

// 设置搜索表单
function setupSearchForm() {
    const form = document.getElementById('searchForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        performSearch();
    });
    
    // 实时搜索（延迟执行）
    let searchTimeout;
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch();
            }, 500);
        });
    });
}

// 检查URL参数
function checkURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // 设置表单值
    if (urlParams.has('category')) {
        document.getElementById('searchCategory').value = urlParams.get('category');
    }
    if (urlParams.has('keyword')) {
        document.getElementById('searchKeyword').value = urlParams.get('keyword');
    }
    if (urlParams.has('status')) {
        document.getElementById('searchStatus').value = urlParams.get('status');
    }
    if (urlParams.has('location')) {
        document.getElementById('searchLocation').value = urlParams.get('location');
    }
    
    // 如果有参数，立即执行搜索
    if (urlParams.toString()) {
        performSearch();
    }
}

// 执行搜索
function performSearch() {
    const formData = new FormData(document.getElementById('searchForm'));
    const searchParams = {
        keyword: formData.get('keyword')?.toLowerCase() || '',
        category: formData.get('category') || '',
        status: formData.get('status') || '',
        location: formData.get('location')?.toLowerCase() || ''
    };

    // 过滤事件
    filteredEvents = allEvents.filter(event => {
        // 关键词搜索
        if (searchParams.keyword) {
            const searchIn = `${event.event_name} ${event.event_description}`.toLowerCase();
            if (!searchIn.includes(searchParams.keyword)) {
                return false;
            }
        }

        // 分类过滤
        if (searchParams.category && event.event_category != searchParams.category) {
            return false;
        }

        // 状态过滤
        if (searchParams.status && event.event_status !== searchParams.status) {
            return false;
        }

        // 地点搜索
        if (searchParams.location) {
            if (!event.event_location.toLowerCase().includes(searchParams.location)) {
                return false;
            }
        }

        return true;
    });

    // 重置分页
    currentPage = 1;
    
    // 显示结果
    displayResults();
    updateResultCount();
    
    // 更新URL（不刷新页面）
    updateURL(searchParams);
}

// 更新URL参数
function updateURL(params) {
    const url = new URL(window.location);
    
    Object.keys(params).forEach(key => {
        if (params[key]) {
            url.searchParams.set(key, params[key]);
        } else {
            url.searchParams.delete(key);
        }
    });
    
    window.history.replaceState({}, '', url);
}

// 显示搜索结果
function displayResults() {
    const container = document.getElementById('searchResults');
    const noResults = document.getElementById('noResults');
    
    if (filteredEvents.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>未找到相关事件</h3>
                <p>请尝试调整搜索条件</p>
                <button class="btn btn-primary" onclick="resetSearch()">
                    <i class="fas fa-redo"></i> 重置搜索
                </button>
            </div>
        `;
        document.getElementById('pagination').style.display = 'none';
        return;
    }

    // 分页
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageEvents = filteredEvents.slice(startIndex, endIndex);

    // 根据视图模式显示结果
    if (currentView === 'grid') {
        displayGridView(pageEvents, container);
    } else {
        displayListView(pageEvents, container);
    }

    // 显示分页
    displayPagination();
}

// 网格视图显示
function displayGridView(events, container) {
    container.innerHTML = `
        <div class="events-grid">
            ${events.map(event => createEventCard(event)).join('')}
        </div>
    `;

    // 添加点击事件
    container.querySelectorAll('.event-card').forEach((card, index) => {
        card.addEventListener('click', () => {
            window.location.href = `event.html?id=${events[index].event_id}`;
        });
    });
}

// 列表视图显示
function displayListView(events, container) {
    container.innerHTML = `
        <div class="events-list">
            ${events.map(event => createEventListItem(event)).join('')}
        </div>
    `;

    // 添加点击事件
    container.querySelectorAll('.event-list-item').forEach((item, index) => {
        item.addEventListener('click', () => {
            window.location.href = `event.html?id=${events[index].event_id}`;
        });
    });
}

// 创建事件卡片
function createEventCard(event) {
    const progress = event.goal_amount > 0 ? (event.current_amount / event.goal_amount) * 100 : 0;
    const isFree = event.ticket_price === 0;
    const statusClass = `status-${event.event_status}`;
    
    return `
        <div class="event-card fade-in">
            <div class="event-image">
                <i class="fas fa-calendar-check"></i>
                <div class="event-status ${statusClass}">${getStatusText(event.event_status)}</div>
            </div>
            <div class="event-content">
                <h3 class="event-title">${event.event_name}</h3>
                <p class="event-description">${event.event_description?.substring(0, 120)}...</p>
                
                <div class="event-meta">
                    <div class="event-meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${formatDate(event.event_date)}</span>
                    </div>
                    <div class="event-meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${event.event_location}</span>
                    </div>
                    <div class="event-meta-item">
                        <i class="fas fa-tag"></i>
                        <span>${event.category_name || '未分类'}</span>
                    </div>
                    <div class="event-meta-item">
                        <i class="fas fa-users"></i>
                        <span>${event.total_tickets_sold || 0} / ${event.max_tickets} 人已参与</span>
                    </div>
                </div>
                
                ${event.goal_amount > 0 ? `
                <div class="event-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                    </div>
                    <div class="progress-text">已筹款 $${(event.current_amount || 0).toLocaleString()} / $${(event.goal_amount || 0).toLocaleString()}</div>
                </div>
                ` : ''}
                
                <div class="event-footer">
                    <div class="event-price ${isFree ? 'free' : ''}">
                        ${isFree ? '免费' : `$${event.ticket_price}`}
                    </div>
                    <div class="event-actions">
                        <button class="btn btn-primary btn-small">
                            <i class="fas fa-info-circle"></i> 查看详情
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 创建事件列表项
function createEventListItem(event) {
    const progress = event.goal_amount > 0 ? (event.current_amount / event.goal_amount) * 100 : 0;
    const isFree = event.ticket_price === 0;
    const statusClass = `status-${event.event_status}`;
    
    return `
        <div class="event-list-item fade-in">
            <div class="event-list-image">
                <i class="fas fa-calendar-check"></i>
                <div class="event-status ${statusClass}">${getStatusText(event.event_status)}</div>
            </div>
            <div class="event-list-content">
                <div class="event-list-header">
                    <h3 class="event-title">${event.event_name}</h3>
                    <div class="event-price ${isFree ? 'free' : ''}">
                        ${isFree ? '免费' : `$${event.ticket_price}`}
                    </div>
                </div>
                
                <p class="event-description">${event.event_description?.substring(0, 200)}...</p>
                
                <div class="event-meta">
                    <div class="event-meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${formatDate(event.event_date)}</span>
                    </div>
                    <div class="event-meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${event.event_location}</span>
                    </div>
                    <div class="event-meta-item">
                        <i class="fas fa-tag"></i>
                        <span>${event.category_name || '未分类'}</span>
                    </div>
                    <div class="event-meta-item">
                        <i class="fas fa-users"></i>
                        <span>${event.total_tickets_sold || 0} / ${event.max_tickets} 人已参与</span>
                    </div>
                </div>
                
                ${event.goal_amount > 0 ? `
                <div class="event-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                    </div>
                    <div class="progress-text">已筹款 $${(event.current_amount || 0).toLocaleString()} / $${(event.goal_amount || 0).toLocaleString()}</div>
                </div>
                ` : ''}
                
                <div class="event-list-actions">
                    <button class="btn btn-primary">
                        <i class="fas fa-info-circle"></i> 查看详情
                    </button>
                </div>
            </div>
        </div>
    `;
}

// 显示分页
function displayPagination() {
    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
    const pagination = document.getElementById('pagination');
    const pageNumbers = document.getElementById('pageNumbers');
    
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }
    
    pagination.style.display = 'flex';
    
    // 更新按钮状态
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
    
    // 生成页码
    pageNumbers.innerHTML = '';
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage + 1 < maxPages) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-number ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => goToPage(i);
        pageNumbers.appendChild(pageBtn);
    }
}

// 切换页面
function changePage(direction) {
    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        displayResults();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// 跳转到指定页面
function goToPage(page) {
    currentPage = page;
    displayResults();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 更新结果计数
function updateResultCount() {
    document.getElementById('resultCount').textContent = filteredEvents.length;
}

// 重置搜索
function resetSearch() {
    document.getElementById('searchForm').reset();
    filteredEvents = [...allEvents];
    currentPage = 1;
    displayResults();
    updateResultCount();
    
    // 清除URL参数
    window.history.replaceState({}, '', window.location.pathname);
}

// 排序结果
function sortResults() {
    const sortBy = document.getElementById('sortBy').value;
    const [field, order] = sortBy.split('-');
    
    filteredEvents.sort((a, b) => {
        let aValue, bValue;
        
        switch (field) {
            case 'date':
                aValue = new Date(a.event_date);
                bValue = new Date(b.event_date);
                break;
            case 'name':
                aValue = a.event_name.toLowerCase();
                bValue = b.event_name.toLowerCase();
                break;
            case 'price':
                aValue = a.ticket_price;
                bValue = b.ticket_price;
                break;
            default:
                return 0;
        }
        
        if (order === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
    
    displayResults();
}

// 设置视图模式
function setView(view) {
    currentView = view;
    
    // 更新按钮状态
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${view}View`).classList.add('active');
    
    // 重新显示结果
    displayResults();
}

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        'upcoming': '即将开始',
        'past': '已结束',
        'suspended': '已暂停'
    };
    return statusMap[status] || status;
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('zh-CN', options);
}

// 显示错误信息
function showError(message) {
    const container = document.getElementById('searchResults');
    container.innerHTML = `
        <div class="error-message" style="text-align: center; padding: 40px; color: #e74c3c;">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 15px;"></i>
            <p>${message}</p>
            <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 15px;">
                <i class="fas fa-redo"></i> 重试
            </button>
        </div>
    `;
}

// 显示关于我们
function showAbout() {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div style="padding: 30px;">
            <h2 style="color: #2c3e50; margin-bottom: 20px; text-align: center;">
                <i class="fas fa-heart" style="color: #e74c3c;"></i> 关于我们
            </h2>
            <div style="line-height: 1.8; color: #34495e;">
                <p style="margin-bottom: 20px;">
                    慈善事件管理系统是一个致力于连接慈善组织与爱心人士的平台。
                    我们相信每个人都能为社会贡献一份力量，通过这个平台，您可以：
                </p>
                <ul style="margin-bottom: 20px; padding-left: 20px;">
                    <li>发现感兴趣的慈善活动</li>
                    <li>在线注册参与活动</li>
                    <li>为慈善事业贡献力量</li>
                    <li>与其他爱心人士交流</li>
                </ul>
                <p style="text-align: center; font-weight: 600; color: #2c3e50;">
                    "参与慈善，改变世界"
                </p>
            </div>
        </div>
    `;
    document.getElementById('modal').style.display = 'block';
}

// 关闭模态框
function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// 模态框事件
document.addEventListener('click', function(e) {
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close');
    
    if (e.target === modal || e.target === closeBtn) {
        closeModal();
    }
});

document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('modal');
    if (e.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
    }
});

// 添加CSS样式
const additionalStyles = `
    <style>
        .search-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 60px 0 40px;
            text-align: center;
        }

        .breadcrumb {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            font-size: 0.9rem;
        }

        .breadcrumb a {
            color: rgba(255,255,255,0.8);
            text-decoration: none;
        }

        .breadcrumb a:hover {
            color: white;
        }

        .search-header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 700;
        }

        .search-form-section {
            padding: 40px 0;
            background: #f8f9fa;
        }

        .search-form-card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .search-form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
        }

        .form-group label {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            font-weight: 600;
            color: #2c3e50;
        }

        .form-group input,
        .form-group select {
            width: 100%;
            padding: 12px;
            border: 2px solid #ecf0f1;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus {
            outline: none;
            border-color: #3498db;
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        .search-form-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
        }

        .search-results-section {
            padding: 40px 0;
            background: white;
        }

        .search-results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            flex-wrap: wrap;
            gap: 15px;
        }

        .search-stats {
            color: #7f8c8d;
            font-weight: 600;
        }

        .search-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            flex-wrap: wrap;
            gap: 15px;
        }

        .sort-controls {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .sort-controls select {
            padding: 8px 12px;
            border: 2px solid #ecf0f1;
            border-radius: 6px;
            background: white;
        }

        .view-controls {
            display: flex;
            gap: 5px;
        }

        .view-btn {
            padding: 8px 12px;
            border: 2px solid #ecf0f1;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .view-btn.active,
        .view-btn:hover {
            background: #3498db;
            color: white;
            border-color: #3498db;
        }

        .events-list {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .event-list-item {
            background: white;
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            cursor: pointer;
            display: flex;
            gap: 20px;
        }

        .event-list-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }

        .event-list-image {
            width: 120px;
            height: 120px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 2rem;
            position: relative;
            flex-shrink: 0;
        }

        .event-list-content {
            flex: 1;
        }

        .event-list-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
        }

        .event-list-actions {
            margin-top: 15px;
        }

        .no-results {
            text-align: center;
            padding: 60px 20px;
            color: #7f8c8d;
        }

        .no-results i {
            font-size: 4rem;
            margin-bottom: 20px;
            color: #bdc3c7;
        }

        .no-results h3 {
            margin-bottom: 10px;
            color: #2c3e50;
        }

        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            margin-top: 40px;
        }

        .page-btn {
            padding: 10px 15px;
            border: 2px solid #ecf0f1;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .page-btn:hover:not(:disabled) {
            background: #3498db;
            color: white;
            border-color: #3498db;
        }

        .page-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .page-numbers {
            display: flex;
            gap: 5px;
        }

        .page-number {
            padding: 8px 12px;
            border: 2px solid #ecf0f1;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            min-width: 40px;
            text-align: center;
        }

        .page-number:hover,
        .page-number.active {
            background: #3498db;
            color: white;
            border-color: #3498db;
        }

        @media (max-width: 768px) {
            .search-form-grid {
                grid-template-columns: 1fr;
            }
            
            .search-results-header {
                flex-direction: column;
                text-align: center;
            }
            
            .search-controls {
                flex-direction: column;
                align-items: stretch;
            }
            
            .event-list-item {
                flex-direction: column;
            }
            
            .event-list-image {
                width: 100%;
                height: 200px;
            }
            
            .pagination {
                flex-wrap: wrap;
            }
        }
    </style>
`;

// 添加样式到页面
document.head.insertAdjacentHTML('beforeend', additionalStyles);

console.log('🔍 PROG2002 A3 搜索页面已加载');