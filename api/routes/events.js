// routes/events.js (匹配你的 event_db.js 结构)

const router = require('express').Router();   // 这样就用的是主文件里已经挂载好中间件的 Router

// 1. 引入你的 event_db.js
var dbcon = require("../event_db.js");


// 获取所有活动
router.get("/", function(req, res) {
    // 2. 每次需要时，调用 getconnection() 获取一个新的连接
    var connection = dbcon.getconnection();

    var sql = "SELECT * FROM events WHERE status = 'Active'";

    // 3. 使用这个连接进行查询
    connection.query(sql, function(err, records) {
        // 4. 查询结束后，关闭连接，释放资源
        connection.end();

        if (err) {
            console.error("Error while retrieving events:", err);
            res.status(500).send({ error: "Error while retrieving events" });
        } else {
            res.send(records);
        }
    });
});

// 搜索活动
router.get("/search", function(req, res) {
    var connection = dbcon.getconnection();

    var name = req.query.name;
    var date = req.query.date;
    var location = req.query.location;
    var category = req.query.category;

    var sql = "SELECT e.*, c.name as category_name FROM events e JOIN categories c ON e.category_id = c.id WHERE e.status = 'Active'";
    var params = [];

    if (name) {
        sql += " AND e.title LIKE ?";
        params.push(`%${name}%`);
    }
    if (date) {
        sql += " AND DATE(e.event_date) = ?";
        params.push(date);
    }
    if (location) {
        sql += " AND e.location LIKE ?";
        params.push(`%${location}%`);
    }
    if (category) {
        sql += " AND c.name = ?";
        params.push(category);
    }

    connection.query(sql, params, function(err, records) {
        connection.end(); // 关闭连接
        if (err) {
            console.error("Error while searching events:", err);
            res.status(500).send({ error: "Error while searching events" });
        } else {
            res.send(records);
        }
    });
});


// 获取单个活动详情 + 注册列表 (GET /api/events/:id)
router.get("/:id", function(req, res) {
    var connection = dbcon.getconnection();
    var id = req.params.id;

    // 获取活动详情
    var eventSql = "SELECT * FROM events WHERE id = " + id;

    connection.query(eventSql, function(err, eventResult) {
        if (err) {
            connection.end();
            console.error(">>> SQL ERROR:", err.message);
            res.status(500).send({ error: "Error while retrieving event", detail: err.message });
            return;
        }

        if (eventResult.length === 0) {
            connection.end();
            return res.status(404).send({ error: "Event not found" });
        }

        var event = eventResult[0];

        // 获取该活动的注册列表，按注册日期倒序排列
        var registrationsSql = "SELECT * FROM registrations WHERE event_id = " + id + " ORDER BY registration_date DESC";

        connection.query(registrationsSql, function(err, registrationsResult) {
            connection.end();

            if (err) {
                console.error(">>> SQL ERROR:", err.message);
                // 即使注册列表查询失败，也返回活动信息
                res.status(500).send({
                    error: "Error while retrieving registrations",
                    event: event,
                    detail: err.message
                });
                return;
            }

            // 将注册列表添加到活动信息中
            event.registrations = registrationsResult;

            res.send(event);
        });
    });
});



// 添加新活动（POST）
router.post('/', function (req, res) {
    var conn = dbcon.getconnection();

    // 1. 取参
    var title       = req.body.title;
    var description = req.body.description;
    var event_date  = req.body.event_date; // ISO 字符串
    var location    = req.body.location;
    var category_id = req.body.category_id;

    // 2. 简单校验
    if (!title || !event_date || !location || !category_id) {
        conn.end();
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // 3. 日期格式化
    var dbDate = new Date(event_date).toISOString().slice(0, 19).replace('T', ' '); // → YYYY-MM-DD HH:mm:ss

    // 4. 占位符 SQL
    var sql = `INSERT INTO events
                   (title, description, event_date, location, category_id)
               VALUES (?, ?, ?, ?, ?)`;
    var par = [title, description, dbDate, location, category_id];

    // 5. 执行
    conn.query(sql, par, function (err, result) {
        conn.end();
        if (err) {
            console.error('>>> POST ERROR:', err.message);
            return res.status(500).json({ error: 'Error while inserting event', detail: err.message });
        }
        res.status(201).json({ insert: 'success', id: result.insertId });
    });
});

// 更新活动（PUT）
router.put("/:id", function(req, res) {
    var connection = dbcon.getconnection();
    var id = req.params.id;
    var title = req.body.title;
    var description = req.body.description;
    var event_date = req.body.event_date;
    var location = req.body.location;
    var category_id = req.body.category_id;
    var status = req.body.status;

    // 添加字段验证
    if (!title || !event_date || !location || !category_id) {
        connection.end();
        return res.status(400).send({ error: "Missing required fields" });
    }

    // 添加日期格式化处理
    var formattedDate;
    try {
        formattedDate = new Date(event_date).toISOString().slice(0, 10);
        console.log("Original date:", event_date);
        console.log("Formatted date for DB:", formattedDate);
    } catch (e) {
        connection.end();
        return res.status(400).send({ error: "Invalid date format" });
    }

    var sql = "UPDATE events SET title = '" + title + "', description = '" + description + "', event_date = '" + formattedDate +
        "', location = '" + location + "', category_id = " + category_id + ", status = '" + status + "' WHERE id = " + id;

    console.log(">>> SQL:", sql); // 看拼接出来的 SQL 长啥样

    connection.query(sql, function(err, result) {
        connection.end(); // 确保关闭连接

        if (err) {
            console.error(">>> SQL ERROR:", err.message);
            res.status(500).send({ error: "Error while updating event", detail: err.message });
            return;
        } else {
            if (result.affectedRows === 0) {
                res.status(404).send({ error: "Event not found" });
            } else {
                res.send({ update: "success" });
            }
        }
    });
});

// 删除活动（DELETE）- 修改为符合A3要求
router.delete("/:id", function(req, res) {
    var connection = dbcon.getconnection();
    var id = req.params.id;

    // 添加ID验证
    if (!id || isNaN(id)) {
        connection.end();
        return res.status(400).send({ error: "Invalid event ID" });
    }

    // 首先检查该活动是否有注册记录
    var checkSql = "SELECT COUNT(*) as count FROM registrations WHERE event_id = " + id;

    connection.query(checkSql, function(err, result) {
        if (err) {
            connection.end(); // 确保关闭连接
            console.error(">>> SQL ERROR:", err.message);
            console.error(">>> SQL:", checkSql);
            res.status(500).send({ error: "Error while checking registrations", detail: err.message });
            return;
        }

        // 如果有注册记录，不允许删除
        if (result[0].count > 0) {
            connection.end(); // 确保关闭连接
            res.status(400).send({ error: "Cannot delete event with existing registrations" });
            return;
        }

        // 如果没有注册记录，执行删除
        var deleteSql = "DELETE FROM events WHERE id = " + id;
        console.log(">>> SQL:", deleteSql); // 看拼接出来的 SQL 长啥样

        connection.query(deleteSql, function(err, result) {
            connection.end(); // 确保关闭连接

            if (err) {
                console.error(">>> SQL ERROR:", err.message);
                res.status(500).send({ error: "Error while deleting event", detail: err.message }); // 修复错误信息
                return;
            } else {
                if (result.affectedRows === 0) {
                    res.status(404).send({ error: "Event not found" });
                } else {
                    res.send({ delete: "success" });
                }
            }
        });
    });
});

module.exports = router;