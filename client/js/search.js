document.addEventListener('DOMContentLoaded', function() {
    // 获取表单元素
    const searchForm = document.getElementById('event-search-form');
    const clearButton = document.getElementById('clear-filters');
    const resultsContainer = document.getElementById('search-results');

    // 表单提交事件
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // 获取表单数据
        const formData = new FormData(searchForm);
        const name = formData.get('name');
        const date = formData.get('date');
        const location = formData.get('location');
        const category = formData.get('category');

        // 构建查询参数
        const queryParams = new URLSearchParams();
        if (name) queryParams.append('name', name);
        if (date) queryParams.append('date', date);
        if (location) queryParams.append('location', location);
        if (category) queryParams.append('category', category);

        // 显示加载状态
        resultsContainer.innerHTML = '<div class="loading">Searching for events...</div>';

        // 调用搜索API
        fetch(`http://localhost:3061/api/events/search?${queryParams.toString()}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(events => {
                // 清空结果容器
                resultsContainer.innerHTML = '';

                // 检查是否有结果
                if (events.length === 0) {
                    resultsContainer.innerHTML = '<p class="no-results">No events found matching your criteria. Try different search terms.</p>';
                    return;
                }

                // 显示结果数量
                const resultCount = document.createElement('p');
                resultCount.className = 'result-count';
                resultCount.textContent = `Found ${events.length} event${events.length !== 1 ? 's' : ''} matching your criteria.`;
                resultsContainer.appendChild(resultCount);

                const searchTerm = formData.get('name') || '';

                // 创建活动卡片
                events.forEach(event => {
                    const eventCard = createEventCard(event, searchTerm); // 传递搜索词参数
                    resultsContainer.appendChild(eventCard);
                });
            })
            .catch(error => {
                console.error('Error searching events:', error);
                resultsContainer.innerHTML = '<p class="error">Failed to search events. Please try again later.</p>';
            });
    });

    // 清除过滤器按钮事件
    clearButton.addEventListener('click', function() {
        // 重置表单
        searchForm.reset();

        // 清空结果
        resultsContainer.innerHTML = '<div class="loading">Enter search criteria and click "Search Events" to find charity events.</div>';
    });

    // 创建活动卡片函数（修改为接收搜索词参数）
    function createEventCard(event, searchTerm) {
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

        // 高亮显示匹配的搜索词（如果有）
        let displayName = event.name;
        if (searchTerm && searchTerm.trim() !== '') {
            // 简单的高亮显示（不区分大小写）
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            displayName = event.name.replace(regex, '<mark>$1</mark>');
        }

        eventCard.innerHTML = `
            <div class="event-header">
                <h3>${displayName}</h3>
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

        return eventCard;
    }
});