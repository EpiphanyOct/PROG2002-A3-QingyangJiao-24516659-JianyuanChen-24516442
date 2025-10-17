var dbcon = require("../event_db.js");
var connection = dbcon.getconnection();
var express = require('express');
var router = express.Router();

connection.connect();//建立数据库连接

// 获取所有活动
router.get("/", function(req, res) {
    var sql = "SELECT * FROM events WHERE status = 'upcoming'";
    connection.query(sql, function(err, records, fields) {
        if (err) {
            console.error("Error while retrieving events:", err);
            res.status(500).send({ error: "Error while retrieving events" });
        } else {
            res.send(records);
        }
    });
});

// 搜索活动（根据日期、位置、类别和名称）
router.get("/search", function(req, res) {
    var name = req.query.name;       // 添加活动名称参数
    var date = req.query.date;
    var location = req.query.location;
    var category = req.query.category;

    var sql = "SELECT e.*, c.name as category_name FROM events e JOIN categories c ON e.category_id = c.id WHERE e.status = 'upcoming'";

    // 添加活动名称模糊搜索
    if (name) {
        sql += " AND e.name LIKE '%" + name + "%'";
    }

    if (date) {
        sql += " AND DATE(e.date) = '" + date + "'";
    }
    if (location) {
        sql += " AND e.location LIKE '%" + location + "%'";
    }
    if (category) {
        sql += " AND c.name = '" + category + "'";
    }

    connection.query(sql, function(err, records, fields) {
        if (err) {
            console.error("Error while searching events:", err);
            res.status(500).send({ error: "Error while searching events" });
        } else {
            res.send(records);
        }
    });
});
// 获取单个活动详情
router.get("/:id", function(req, res) {
    var sql = "SELECT * FROM events WHERE id = " + req.params.id;
    connection.query(sql, function(err, records, fields) {
        if (err) {
            console.error("Error while retrieving event:", err);
            res.status(500).send({ error: "Error while retrieving event" });
        } else {
            if (records.length === 0) {
                res.status(404).send({ error: "Event not found" });
            } else {
                res.send(records[0]);
            }
        }
    });
});



module.exports = router;
