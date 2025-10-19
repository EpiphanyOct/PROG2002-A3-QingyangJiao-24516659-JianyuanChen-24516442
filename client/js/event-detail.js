document.addEventListener('DOMContentLoaded', function() {
    // 获取URL参数中的活动ID
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    // 获取活动详情容器
    const eventDetailContainer = document.getElementById('event-detail-container');

    // 检查是否有活动ID
    if (!eventId) {
        eventDetailContainer.innerHTML = '<p class="error">No event ID specified. Please go back and select an event.</p>';
        return;
    }

    // 调用API获取活动详情
    fetch(`http://localhost:3061/api/events/${eventId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(event => {
            // 格式化日期
            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // 格式化价格
            const formattedPrice = event.ticket_price === 0 ? 'Free' : `$${event.ticket_price}`;

            // 计算筹款进度百分比
            const progressPercentage = Math.min(100, (event.progress / event.goal) * 100);

            // 创建活动详情HTML
            eventDetailContainer.innerHTML = `
                <div class="event-detail-header">
                    <h2>${event.name}</h2>
                    <span class="event-category">${event.category_name}</span>
                </div>
                
                <div class="event-detail-content">
                    <div class="event-detail-meta">
                        <div class="meta-item">
                            <i class="icon-calendar"></i>
                            <span>${formattedDate}</span>
                        </div>
                        <div class="meta-item">
                            <i class="icon-location"></i>
                            <span>${event.location}</span>
                        </div>
                        <div class="meta-item">
                            <i class="icon-ticket"></i>
                            <span>${formattedPrice}</span>
                        </div>
                    </div>
                    
                    <div class="event-detail-description">
                        <h3>About This Event</h3>
                        <p>${event.description}</p>
                    </div>
                    
                    <div class="event-detail-fundraising">
                        <h3>Fundraising Goal</h3>
                        <div class="fundraising-info">
                            <div class="fundraising-amounts">
                                <span class="raised">Raised: $${event.progress}</span>
                                <span class="goal">Goal: $${event.goal}</span>
                            </div>
                            <div class="progress-bar-container">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                                </div>
                                <span class="progress-percentage">${progressPercentage.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="event-detail-registration">
                        <button id="register-btn" class="btn btn-primary">Register for This Event</button>
                    </div>
                </div>
            `;

            // 添加注册按钮事件
            const registerBtn = document.getElementById('register-btn');
            registerBtn.addEventListener('click', function() {
                // 显示开发中提示
                alert('This feature is currently under construction.');
            });
        })
        .catch(error => {
            console.error('Error fetching event details:', error);
            eventDetailContainer.innerHTML = '<p class="error">Failed to load event details. Please try again later.</p>';
        });
});