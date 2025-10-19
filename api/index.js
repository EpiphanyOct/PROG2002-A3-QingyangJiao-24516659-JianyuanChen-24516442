const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// 数据库连接测试
const { testConnection } = require('./event_db');

// API路由
const eventRoutes = require('./routes/events');
const categoryRoutes = require('./routes/categories');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, '../client')));

// API路由
app.use('/api/events', eventRoutes);
app.use('/api/categories', categoryRoutes);

// 健康检查端点
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});

// 首页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'index.html'));
});

// 搜索页面路由
app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'search.html'));
});

// 活动详情页面路由
app.get('/event', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'event-detail.html'));
});

// 404处理
app.use((req, res) => {
    res.status(404).json({ error: 'Page not found' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 启动服务器
async function startServer() {
    try {
        // 测试数据库连接
        await testConnection();
        
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Website URL: http://localhost:${PORT}`);
            console.log(`API URL: http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();