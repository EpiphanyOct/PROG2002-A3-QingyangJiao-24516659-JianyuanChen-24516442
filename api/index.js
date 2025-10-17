var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var app =express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// CORS 解决前端跨域
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});


// API路由
var eventsAPI = require("./routes/events");
var categoriesAPI = require("./routes/categories");

app.use("/api/events", eventsAPI);
app.use("/api/categories", categoriesAPI);

// 启动服务器
var PORT = 3061;
app.listen(PORT, function() {
    console.log("Server up and running on port " + PORT);
});