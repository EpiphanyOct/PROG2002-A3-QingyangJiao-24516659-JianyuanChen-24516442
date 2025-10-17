const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// 中间件配置
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 静态文件服务（指向client目录）
app.use(express.static(path.join(__dirname, 'client')));

// 路由：主页
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "index.html"));
});

// 路由：搜索页面
app.get("/search", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "search.html"));
});

// 路由：活动详情页面
app.get("/event-detail", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "event-detail.html"));
});

// 启动服务器
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Frontend server running on port ${PORT}`);
});