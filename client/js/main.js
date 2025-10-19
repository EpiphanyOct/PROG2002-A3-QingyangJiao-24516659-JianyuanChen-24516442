// PROG2002 A3 - Client Side JavaScript
// 客户端主要JavaScript功能

// API配置
const API_BASE_URL = window.location.origin + '/api';

// 全局变量
let eventsData = [];
let categoriesData = [];
let registrationsData = [];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 初始化应用
async function initializeApp() {
    try {
        showLoading('upcomingEvents');
        showLoading('categories');
        showLoading('recentRegistrations');
        
        // 并行加载所有数据
        await Promise.all([
            loadStats(),
            loadUpcomingEvents(),
            loadCategories(),
            loadRecentRegistrations()
        ]);
        
        console.log('✅ 应用初始化完成');
    } catch (error) {
        console.error('❌ 应用初始化失败:', error);
        showError('初始化失败，请刷新页面重试');
    }
}

// 显示加载状态
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>加载中...</p>
            </div>
        `;
    }
}

// 显示错误信息
function showError(message, containerId = null) {
    const errorHTML = `
        <div class="error-message" style="text-align: center; padding: 40px; color: #e74c3c;">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 15px;"></i>
            <p>${message}</p>
            <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 15px;">
                <i class="fas fa-redo"></i> 重试
            </button>
        </div>
    `;
    
    if (containerId) {
        document.getElementById(containerId).innerHTML = errorHTML;
    } else {
        // 显示在页面顶部
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = errorHTML;
        document.body.insertBefore(errorDiv, document.body.firstChild);
    }
}

// 加载统计信息
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/events/stats/overview`);
        const result = await response.json();
        
        if (result.success) {
            const { events, registrations } = result.data;
            
            // 更新统计数据
            animateNumber('totalEvents', events.total_events || 0);
            animateNumber('totalRegistrations', registrations.total_registrations || 0);
            animateNumber('totalRaised', `$${(events.total_raised || 0).toLocaleString()}`);
            animateNumber('totalTickets', registrations.total_tickets_sold || 0);
        }
    } catch (error) {
        console.error('加载统计信息失败:', error);
    }
}

// 数字动画效果
function animateNumber(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const isPrice = typeof targetValue === 'string' && targetValue.startsWith('$');
    const numericValue = isPrice ? 
        parseFloat(targetValue.replace(/[$,]/g, '')) : 
        parseInt(targetValue);
    
    let currentValue = 0;
    const increment = numericValue / 50;
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= numericValue) {
            currentValue = numericValue;
            clearInterval(timer);
        }
        
        if (isPrice) {
            element.textContent = `$${Math.floor(currentValue).toLocaleString()}`;
        } else {
            element.textContent = Math.floor(currentValue).toLocaleString();
        }
    }, 30);
}

// 加载即将开始的事件
async function loadUpcomingEvents() {
    try {
        const response = await fetch(`${API_BASE_URL}/events?status=upcoming`);
        const result = await response.json();
        
        if (result.success) {
            eventsData = result.data;
            displayUpcomingEvents(eventsData.slice(0, 6)); // 显示前6个事件
        }
    } catch (error) {
        console.error('加载事件失败:', error);
        showError('加载事件失败', 'upcomingEvents');
    }
}

// 显示即将开始的事件
function displayUpcomingEvents(events) {
    const container = document.getElementById('upcomingEvents');
    if (!container) return;
    
    if (events.length === 0) {
        container.innerHTML = `
            <div class="no-events" style="text-align: center; padding: 40px; color: #7f8c8d; grid-column: 1 / -1;">
                <i class="fas fa-calendar-times" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <p>暂无即将开始的事件</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = events.map(event => createEventCard(event)).join('');
    
    // 添加点击事件
    container.querySelectorAll('.event-card').forEach((card, index) => {
        card.addEventListener('click', () => {
            window.location.href = `event.html?id=${events[index].event_id}`;
        });
    });
}

// 创建事件卡片HTML
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
                <p class="event-description">${event.event_description?.substring(0, 100)}...</p>
                
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

// 加载分类
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const result = await response.json();
        
        if (result.success) {
            categoriesData = result.data;
            displayCategories(categoriesData);
        }
    } catch (error) {
        console.error('加载分类失败:', error);
        showError('加载分类失败', 'categories');
    }
}

// 显示分类
function displayCategories(categories) {
    const container = document.getElementById('categories');
    if (!container) return;
    
    container.innerHTML = categories.map(category => `
        <div class="category-card fade-in" onclick="searchByCategory(${category.category_id})">
            <div class="category-icon">
                <i class="${getCategoryIcon(category.category_name)}"></i>
            </div>
            <div class="category-name">${category.category_name}</div>
            <div class="category-count">${category.event_count || 0} 个事件</div>
        </div>
    `).join('');
}

// 获取分类图标
function getCategoryIcon(categoryName) {
    const iconMap = {
        '慈善晚宴': 'fas fa-utensils',
        '跑步活动': 'fas fa-running',
        '音乐会': 'fas fa-music',
        '拍卖活动': 'fas fa-gavel',
        '社区服务': 'fas fa-hands-helping',
        '教育活动': 'fas fa-graduation-cap'
    };
    
    return iconMap[categoryName] || 'fas fa-calendar-alt';
}

// 按分类搜索
function searchByCategory(categoryId) {
    window.location.href = `search.html?category=${categoryId}`;
}

// 加载最新注册
async function loadRecentRegistrations() {
    try {
        const response = await fetch(`${API_BASE_URL}/registrations`);
        const result = await response.json();
        
        if (result.success) {
            registrationsData = result.data;
            displayRecentRegistrations(registrationsData.slice(0, 8)); // 显示前8个
        }
    } catch (error) {
        console.error('加载注册信息失败:', error);
        showError('加载注册信息失败', 'recentRegistrations');
    }
}

// 显示最新注册
function displayRecentRegistrations(registrations) {
    const container = document.getElementById('recentRegistrations');
    if (!container) return;
    
    if (registrations.length === 0) {
        container.innerHTML = `
            <div class="no-registrations" style="text-align: center; padding: 40px; color: #7f8c8d;">
                <i class="fas fa-user-check" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <p>暂无最新参与记录</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = registrations.map(registration => createRegistrationItem(registration)).join('');
}

// 创建注册项HTML
function createRegistrationItem(registration) {
    const initials = registration.user_name.split('').filter(char => /[\u4e00-\u9fa5]/.test(char)).slice(0, 2).join('') || 
                    registration.user_name.substring(0, 2).toUpperCase();
    
    return `
        <div class="registration-item fade-in">
            <div class="registration-avatar">
                ${initials}
            </div>
            <div class="registration-content">
                <div class="registration-user">${registration.user_name}</div>
                <div class="registration-event">参与了 "${registration.event_name}"</div>
                <div class="registration-time">${formatTimeAgo(registration.registration_date)}</div>
            </div>
            <div class="registration-tickets">
                ${registration.ticket_count} 张票
            </div>
        </div>
    `;
}

// 格式化时间差
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return '刚刚';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}分钟前`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}小时前`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}天前`;
    }
}

// 显示关于我们模态框
function showAbout() {
    const modal = document.getElementById('modal');
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
                <p style="margin-bottom: 20px;">
                    本平台是PROG2002 A3项目的成果，展示了完整的Web开发技能，
                    包括前端设计、后端API开发、数据库设计和团队协作。
                </p>
                <div style="text-align: center; margin-top: 30px;">
                    <p style="font-weight: 600; color: #2c3e50;">
                        "参与慈善，改变世界"
                    </p>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// 模态框关闭事件
document.addEventListener('click', function(e) {
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close');
    
    if (e.target === modal || e.target === closeBtn) {
        modal.style.display = 'none';
    }
});

// 键盘ESC关闭模态框
document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('modal');
    if (e.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
    }
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 页面滚动效果
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        navbar.style.backdropFilter = 'none';
    }
});

// 错误处理
window.addEventListener('error', function(e) {
    console.error('页面错误:', e.error);
});

// 未处理的Promise拒绝
window.addEventListener('unhandledrejection', function(e) {
    console.error('未处理的Promise拒绝:', e.reason);
    e.preventDefault();
});

console.log('🚀 PROG2002 A3 客户端已加载');