document.addEventListener('DOMContentLoaded', function() {
    // 获取活动列表容器
    const eventsContainer = document.getElementById('events-container');

    // 从API获取活动数据
    fetch('http://localhost:3061/api/events')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(events => {
            // 清空加载提示
            eventsContainer.innerHTML = '';

            // 检查是否有活动
            if (events.length === 0) {
                eventsContainer.innerHTML = '<p class="no-events">No upcoming events at this time.</p>';
                return;
            }

            // 创建活动卡片
            events.forEach(event => {
                const eventCard = document.createElement('div');
                eventCard.className = 'event-card';

                // 格式化日期
                const eventDate = new Date(event.date);
                const formattedDate = eventDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                // 格式化价格
                const formattedPrice = event.ticket_price === 0 ? 'Free' : `$${event.ticket_price}`;

                eventCard.innerHTML = `
                    <div class="event-header">
                        <h3>${event.name}</h3>
                        <span class="event-category">${event.category_name}</span>
                    </div>
                    <div class="event-details">
                        <div class="event-meta">
                            <div class="event-date">
                                <i class="icon-calendar"></i>
                                <span>${formattedDate}</span>
                            </div>
                            <div class="event-location">
                                <i class="icon-location"></i>
                                <span>${event.location}</span>
                            </div>
                            <div class="event-price">
                                <i class="icon-ticket"></i>
                                <span>${formattedPrice}</span>
                            </div>
                        </div>
                        <p class="event-description">${event.description.substring(0, 120)}...</p>
                    </div>
                    <div class="event-footer">
                        <div class="event-progress">
                            <span class="progress-label">Raised: $${event.progress} of $${event.goal}</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min(100, (event.progress / event.goal) * 100)}%"></div>
                            </div>
                        </div>
                        <a href="event-detail.html?id=${event.id}" class="event-link">View Details</a>
                    </div>
                `;

                eventsContainer.appendChild(eventCard);
            });
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            eventsContainer.innerHTML = '<p class="error">Failed to load events. Please try again later.</p>';
        });
});