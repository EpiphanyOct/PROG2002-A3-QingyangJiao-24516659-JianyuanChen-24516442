var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var app = express();

// 中间件配置
app.use(bodyParser.json());
// 推荐将 extended 设置为 true，以支持更丰富的数据类型
app.use(bodyParser.urlencoded({ extended: true }));

// CORS 解决前端跨域
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    // 关键修改：在允许的方法中添加 OPTIONS
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // 关键修改：处理 OPTIONS 预检请求
    if (req.method === 'OPTIONS') {
        res.sendStatus(200); // 直接返回成功状态码
    } else {
        next(); // 继续处理其他请求
    }
});

// API路由
var eventsAPI = require("./routes/events");
var categoriesAPI = require("./routes/categories");
var registrationsAPI = require("./routes/registrations");

// 确保路由前缀正确
app.use("/api/events", eventsAPI);
app.use("/api/categories", categoriesAPI);
app.use("/api/registrations", registrationsAPI);

// 关键修改：使用环境变量中的端口，兼容 cPanel
var PORT = process.env.PORT || 3060;
app.listen(PORT, function() {
    console.log("Server up and running on port " + PORT);
});