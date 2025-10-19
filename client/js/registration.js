// PROG2002 A3 - Registration Page JavaScript
// 事件注册页面功能

const API_BASE_URL = window.location.origin + '/api';

// 全局变量
let currentEvent = null;
let eventId = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeRegistrationPage();
});

// 初始化注册页面
async function initializeRegistrationPage() {
    eventId = getQueryParam('id');
    
    if (!eventId) {
        showError('未指定事件ID');
        setTimeout(() => {
            window.location.href = 'search.html';
        }, 2000);
        return;
    }

    try {
        // 并行加载事件信息和相关事件
        await Promise.all([
            loadEventDetails(),
            loadRelatedEvents()
        ]);
        
        // 设置表单验证
        setupFormValidation();
        
        console.log('✅ 注册页面初始化完成');
    } catch (error) {
        console.error('❌ 注册页面初始化失败:', error);
        showError('页面初始化失败，请重试');
    }
}

// 获取URL参数
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// 加载事件详情
async function loadEventDetails() {
    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
        const result = await response.json();

        if (result.success) {
            currentEvent = result.data;
            displayEventInfo(currentEvent);
            setupTicketOptions();
        } else {
            showError(result.error || '事件不存在');
            setTimeout(() => {
                window.location.href = 'search.html';
            }, 2000);
        }
    } catch (error) {
        console.error('加载事件详情失败:', error);
        showError('加载事件详情失败');
    }
}

// 显示事件信息
function displayEventInfo(event) {
    const container = document.getElementById('eventInfo');
    const isFree = event.ticket_price === 0;
    const progress = event.goal_amount > 0 ? (event.current_amount / event.goal_amount) * 100 : 0;
    
    container.innerHTML = `
        <div class="event-info-content">
            <h1>${event.event_name}</h1>
            
            <div class="event-meta-detailed">
                <div class="meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>${formatDate(event.event_date)}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${event.event_location}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-tag"></i>
                    <span>${event.category_name || '未分类'}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-users"></i>
                    <span>${event.total_tickets_sold || 0} / ${event.max_tickets} 人已参与</span>
                </div>
            </div>
            
            <div class="event-price-display">
                <div class="price-label">票价:</div>
                <div class="price-value ${isFree ? 'free' : ''}">
                    ${isFree ? '免费' : `$${event.ticket_price}`}
                </div>
            </div>
            
            ${event.goal_amount > 0 ? `
            <div class="event-progress-detailed">
                <div class="progress-bar-large">
                    <div class="progress-fill-large" style="width: ${Math.min(progress, 100)}%"></div>
                </div>
                <div class="progress-info">
                    <span>${percentage.toFixed(1)}% 完成</span>
                    <span>$${(event.current_amount || 0).toLocaleString()} / $${(event.goal_amount || 0).toLocaleString()}</span>
                </div>
            </div>
            ` : ''}
            
            <div class="event-description-detailed">
                <h3>事件描述</h3>
                <p>${event.event_description || '暂无描述'}</p>
            </div>
        </div>
    `;
}

// 设置票数选项
function setupTicketOptions() {
    const select = document.getElementById('ticketCount');
    const availableTickets = currentEvent.max_tickets - (currentEvent.total_tickets_sold || 0);
    const maxSelectable = Math.min(5, availableTickets);
    
    // 清空现有选项
    select.innerHTML = '<option value="">请选择票数</option>';
    
    // 添加票数选项
    for (let i = 1; i <= maxSelectable; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i} 张票 ${currentEvent.ticket_price > 0 ? `($${currentEvent.ticket_price * i})` : '(免费)'}`;
        select.appendChild(option);
    }
    
    // 添加变化事件监听
    select.addEventListener('change', updateTicketSummary);
}

// 更新票务摘要
function updateTicketSummary() {
    const ticketCount = parseInt(document.getElementById('ticketCount').value) || 0;
    const summary = document.getElementById('ticketSummary');
    
    if (ticketCount > 0) {
        const totalPrice = ticketCount * currentEvent.ticket_price;
        
        document.getElementById('selectedTickets').textContent = ticketCount;
        document.getElementById('ticketPrice').textContent = currentEvent.ticket_price > 0 ? 
            `$${currentEvent.ticket_price}` : '免费';
        document.getElementById('totalPrice').textContent = totalPrice > 0 ? 
            `$${totalPrice}` : '免费';
        
        summary.style.display = 'block';
    } else {
        summary.style.display = 'none';
    }
}

// 设置表单验证
function setupFormValidation() {
    const form = document.getElementById('registrationForm');
    
    // 实时验证
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearError(input.name));
    });
    
    // 表单提交
    form.addEventListener('submit', handleFormSubmit);
}

// 验证单个字段
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';
    
    switch (fieldName) {
        case 'userName':
            if (!value) {
                errorMessage = '姓名不能为空';
                isValid = false;
            } else if (value.length < 2) {
                errorMessage = '姓名至少需要2个字符';
                isValid = false;
            }
            break;
            
        case 'userEmail':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) {
                errorMessage = '邮箱不能为空';
                isValid = false;
            } else if (!emailRegex.test(value)) {
                errorMessage = '请输入有效的邮箱地址';
                isValid = false;
            }
            break;
            
        case 'userPhone':
            if (value && !/^\d{6,15}$/.test(value.replace(/[\s\-\+]/g, ''))) {
                errorMessage = '请输入有效的电话号码';
                isValid = false;
            }
            break;
            
        case 'ticketCount':
            if (!value) {
                errorMessage = '请选择票数';
                isValid = false;
            }
            break;
            
        case 'terms':
            if (!field.checked) {
                errorMessage = '您必须同意服务条款';
                isValid = false;
            }
            break;
    }
    
    displayFieldError(fieldName, errorMessage);
    return isValid;
}

// 验证整个表单
function validateForm() {
    const form = document.getElementById('registrationForm');
    const requiredFields = ['userName', 'userEmail', 'ticketCount', 'terms'];
    let isValid = true;
    
    requiredFields.forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// 显示字段错误
function displayFieldError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}Error`);
    const field = document.querySelector(`[name="${fieldName}"]`);
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = message ? 'block' : 'none';
    }
    
    if (field) {
        if (message) {
            field.classList.add('error');
        } else {
            field.classList.remove('error');
        }
    }
}

// 清除错误信息
function clearError(fieldName) {
    const errorElement = document.getElementById(`${fieldName}Error`);
    const field = document.querySelector(`[name="${fieldName}"]`);
    
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
    
    if (field) {
        field.classList.remove('error');
    }
}

// 处理表单提交
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // 验证表单
    if (!validateForm()) {
        showModal('表单错误', '请检查并修正表单中的错误');
        return;
    }
    
    // 禁用提交按钮
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 处理中...';
    
    try {
        // 收集表单数据
        const formData = new FormData(e.target);
        const registrationData = {
            event_id: parseInt(eventId),
            user_name: formData.get('userName').trim(),
            user_email: formData.get('userEmail').trim(),
            user_phone: formData.get('userPhone')?.trim() || null,
            ticket_count: parseInt(formData.get('ticketCount'))
        };
        
        // 检查事件状态
        if (currentEvent.event_status !== 'upcoming') {
            showModal('注册失败', '该事件当前无法接受新的注册');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            return;
        }
        
        // 检查容量
        if ((currentEvent.total_tickets_sold || 0) + registrationData.ticket_count > currentEvent.max_tickets) {
            showModal('容量不足', '抱歉，该事件剩余票数不足');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            return;
        }
        
        // 提交注册
        const response = await fetch(`${API_BASE_URL}/registrations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registrationData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccessModal(registrationData);
        } else {
            showModal('注册失败', result.error || '注册失败，请重试');
        }
        
    } catch (error) {
        console.error('注册失败:', error);
        showModal('网络错误', '网络连接失败，请重试');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// 显示成功模态框
function showSuccessModal(registrationData) {
    const totalAmount = registrationData.ticket_count * currentEvent.ticket_price;
    
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div style="padding: 30px; text-align: center;">
            <div style="background: #27ae60; color: white; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 2rem;">
                <i class="fas fa-check"></i>
            </div>
            
            <h2 style="color: #27ae60; margin-bottom: 20px;">注册成功！</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: left;">
                <h4 style="margin-bottom: 15px; color: #2c3e50;">注册信息确认</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9rem;">
                    <div><strong>事件:</strong> ${currentEvent.event_name}</div>
                    <div><strong>姓名:</strong> ${registrationData.user_name}</div>
                    <div><strong>邮箱:</strong> ${registrationData.user_email}</div>
                    <div><strong>票数:</strong> ${registrationData.ticket_count} 张</div>
                    <div><strong>时间:</strong> ${formatDate(currentEvent.event_date)}</div>
                    ${totalAmount > 0 ? `<div><strong>费用:</strong> $${totalAmount}</div>` : ''}
                </div>
            </div>
            
            <p style="margin-bottom: 20px; color: #7f8c8d;">
                确认邮件已发送至 ${registrationData.user_email}<br>
                请查收邮件获取详细信息
            </p>
            
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="closeModal(); window.location.href='index.html';" class="btn btn-primary">
                    <i class="fas fa-home"></i> 返回首页
                </button>
                <button onclick="closeModal(); window.location.href='search.html';" class="btn btn-secondary">
                    <i class="fas fa-search"></i> 继续浏览
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('modal').style.display = 'block';
}

// 加载相关事件
async function loadRelatedEvents() {
    try {
        const response = await fetch(`${API_BASE_URL}/events?status=upcoming`);
        const result = await response.json();
        
        if (result.success) {
            const relatedEvents = result.data
                .filter(event => event.event_id != eventId)
                .slice(0, 3); // 显示3个相关事件
            
            displayRelatedEvents(relatedEvents);
        }
    } catch (error) {
        console.error('加载相关事件失败:', error);
    }
}

// 显示相关事件
function displayRelatedEvents(events) {
    const container = document.getElementById('relatedEvents');
    
    if (events.length === 0) {
        container.innerHTML = `
            <div class="no-events" style="text-align: center; padding: 40px; color: #7f8c8d; grid-column: 1 / -1;">
                <i class="fas fa-calendar-times" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <p>暂无相关事件</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = events.map(event => createRelatedEventCard(event)).join('');
    
    // 添加点击事件
    container.querySelectorAll('.event-card').forEach((card, index) => {
        card.addEventListener('click', () => {
            window.location.href = `registration.html?id=${events[index].event_id}`;
        });
    });
}

// 创建相关事件卡片
function createRelatedEventCard(event) {
    const isFree = event.ticket_price === 0;
    const progress = event.goal_amount > 0 ? (event.current_amount / event.goal_amount) * 100 : 0;
    
    return `
        <div class="event-card fade-in">
            <div class="event-image">
                <i class="fas fa-calendar-check"></i>
                <div class="event-status status-${event.event_status}">${getStatusText(event.event_status)}</div>
            </div>
            <div class="event-content">
                <h3 class="event-title">${event.event_name}</h3>
                <p class="event-description">${event.event_description?.substring(0, 80)}...</p>
                
                <div class="event-meta">
                    <div class="event-meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${formatDate(event.event_date)}</span>
                    </div>
                    <div class="event-meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${event.event_location}</span>
                    </div>
                </div>
                
                <div class="event-footer">
                    <div class="event-price ${isFree ? 'free' : ''}">
                        ${isFree ? '免费' : `$${event.ticket_price}`}
                    </div>
                    <div class="event-actions">
                        <button class="btn btn-primary btn-small">
                            <i class="fas fa-user-plus"></i> 立即注册
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 取消注册
function cancelRegistration() {
    if (confirm('确定要取消注册吗？您输入的信息将不会被保存。')) {
        window.location.href = `event.html?id=${eventId}`;
    }
}

// 显示服务条款
function showTerms() {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div style="padding: 30px; max-height: 70vh; overflow-y: auto;">
            <h2 style="color: #2c3e50; margin-bottom: 20px; text-align: center;">
                <i class="fas fa-file-contract" style="color: #3498db;"></i> 服务条款
            </h2>
            
            <div style="line-height: 1.8; color: #34495e; margin-bottom: 20px;">
                <h4>1. 注册条款</h4>
                <p>通过注册参与慈善活动，您同意提供真实准确的个人信息。我们保留验证您身份的权利。</p>
                
                <h4>2. 活动参与</h4>
                <p>参与者需遵守活动规定和组织者的安排。如有特殊情况需要取消参与，请提前通知组织者。</p>
                
                <h4>3. 费用和退款</h4>
                <p>活动费用用于支持慈善事业。除非活动取消，一般情况下不予退款。如遇不可抗力导致活动取消，将全额退款。</p>
                
                <h4>4. 隐私保护</h4>
                <p>我们严格保护您的个人信息，仅用于活动组织和联系。不会将您的信息用于商业目的或提供给第三方。</p>
                
                <h4>5. 责任声明</h4>
                <p>参与者需对自己的行为负责。在活动过程中如发生意外，组织者将尽力协助，但不承担法律责任。</p>
                
                <h4>6. 知识产权</h4>
                <p>活动期间拍摄的照片和视频可能用于宣传目的。如有异议，请提前告知组织者。</p>
                
                <h4>7. 条款修改</h4>
                <p>我们保留修改服务条款的权利。重要变更将通过邮件通知注册用户。</p>
            </div>
            
            <div style="text-align: center;">
                <button onclick="closeModal()" class="btn btn-primary">
                    <i class="fas fa-check"></i> 我已阅读并同意
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('modal').style.display = 'block';
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

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        'upcoming': '即将开始',
        'past': '已结束',
        'suspended': '已暂停'
    };
    return statusMap[status] || status;
}

// 显示错误信息
function showError(message) {
    const container = document.querySelector('.registration-section .container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        background: #e74c3c;
        color: white;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        text-align: center;
    `;
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i> ${message}
    `;
    
    container.insertBefore(errorDiv, container.firstChild);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 3000);
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
                    我们相信每个人都能为社会贡献一份力量。
                </p>
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
        .registration-header {
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

        .registration-section {
            padding: 40px 0;
            background: #f8f9fa;
        }

        .registration-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .event-info-card,
        .registration-form-card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .event-image-large {
            width: 100%;
            height: 200px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 3rem;
            margin-bottom: 20px;
            position: relative;
        }

        .event-info-content h1 {
            font-size: 1.8rem;
            color: #2c3e50;
            margin-bottom: 20px;
        }

        .event-meta-detailed {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 20px;
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #34495e;
        }

        .meta-item i {
            color: #3498db;
            width: 16px;
        }

        .event-price-display {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
        }

        .price-label {
            font-weight: 600;
            color: #2c3e50;
        }

        .price-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #27ae60;
        }

        .price-value.free {
            color: #3498db;
        }

        .event-progress-detailed {
            margin-bottom: 20px;
        }

        .progress-bar-large {
            background: #ecf0f1;
            border-radius: 10px;
            overflow: hidden;
            height: 12px;
            margin-bottom: 10px;
        }

        .progress-fill-large {
            background: linear-gradient(90deg, #27ae60, #2ecc71);
            height: 100%;
            border-radius: 10px;
            transition: width 1s ease-in-out;
        }

        .progress-info {
            display: flex;
            justify-content: space-between;
            font-size: 0.9rem;
            color: #7f8c8d;
        }

        .event-description-detailed {
            margin-bottom: 20px;
        }

        .event-description-detailed h3 {
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 1.1rem;
        }

        .event-description-detailed p {
            color: #34495e;
            line-height: 1.6;
        }

        .registration-form-card h2 {
            color: #2c3e50;
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .form-section {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #ecf0f1;
        }

        .form-section:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }

        .form-section h3 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 1.1rem;
        }

        .form-group {
            margin-bottom: 20px;
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
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #ecf0f1;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.3s ease;
            font-family: inherit;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #3498db;
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        .form-group input.error,
        .form-group select.error,
        .form-group textarea.error {
            border-color: #e74c3c;
            box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
        }

        .error-message {
            color: #e74c3c;
            font-size: 0.8rem;
            margin-top: 5px;
            display: none;
        }

        .ticket-summary {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
        }

        .summary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }

        .summary-item.total {
            font-weight: 700;
            font-size: 1.1rem;
            color: #2c3e50;
            border-top: 1px solid #bdc3c7;
            padding-top: 8px;
            margin-top: 8px;
        }

        .checkbox-label {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            cursor: pointer;
            font-weight: normal;
            line-height: 1.4;
        }

        .checkbox-label input[type="checkbox"] {
            width: auto;
            margin: 0;
            transform: translateY(2px);
        }

        .checkbox-label a {
            color: #3498db;
            text-decoration: none;
        }

        .checkbox-label a:hover {
            text-decoration: underline;
        }

        .form-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 30px;
        }

        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .btn-primary {
            background: #3498db;
            color: white;
        }

        .btn-primary:hover {
            background: #2980b9;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
        }

        .btn-primary:disabled {
            background: #bdc3c7;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }

        .btn-secondary {
            background: #95a5a6;
            color: white;
        }

        .btn-secondary:hover {
            background: #7f8c8d;
        }

        .related-events-section {
            padding: 40px 0;
            background: white;
        }

        .related-events-section h2 {
            text-align: center;
            margin-bottom: 30px;
            color: #2c3e50;
        }

        .related-events-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }

        @media (max-width: 768px) {
            .registration-grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .form-actions {
                flex-direction: column;
            }
            
            .form-actions .btn {
                width: 100%;
                justify-content: center;
            }
        }
    </style>
`;

// 添加样式到页面
document.head.insertAdjacentHTML('beforeend', additionalStyles);

console.log('📝 PROG2002 A3 注册页面已加载');