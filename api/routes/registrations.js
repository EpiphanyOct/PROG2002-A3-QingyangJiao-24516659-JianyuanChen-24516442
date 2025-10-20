var dbcon = require("../event_db.js");
var express = require('express');
var router = express.Router();

// 创建注册记录 (POST /api/registrations)
router.post("/", function(req, res) {
    var connection = dbcon.getconnection();

    // 从请求体中获取注册数据
    var event_id = req.body.event_id;
    var user_name = req.body.user_name;
    var user_email = req.body.user_email;
    var tickets_purchased = req.body.tickets_purchased;

    // 验证必填字段
    if (!event_id || !user_name || !user_email || !tickets_purchased) {
        connection.end();
        return res.status(400).send({ error: "Missing required fields: event_id, user_name, user_email, tickets_purchased" });
    }

    // 验证票数是否为正整数
    if (isNaN(tickets_purchased) || tickets_purchased <= 0) {
        connection.end();
        return res.status(400).send({ error: "Invalid tickets_purchased value" });
    }

    // 首先检查活动是否存在
    var checkEventSql = "SELECT id, title FROM events WHERE id = " + event_id;

    connection.query(checkEventSql, function(err, eventResult) {
        if (err) {
            connection.end();
            console.error(">>> SQL ERROR:", err.message);
            res.status(500).send({ error: "Error while checking event", detail: err.message });
            return;
        }

        // 如果活动不存在
        if (eventResult.length === 0) {
            connection.end();
            return res.status(404).send({ error: "Event not found" });
        }

        // 检查用户是否已经注册过该活动
        var checkRegistrationSql = "SELECT id FROM registrations WHERE event_id = " + event_id + " AND user_email = '" + user_email + "'";

        connection.query(checkRegistrationSql, function(err, regResult) {
            if (err) {
                connection.end();
                console.error(">>> SQL ERROR:", err.message);
                res.status(500).send({ error: "Error while checking existing registration", detail: err.message });
                return;
            }

            // 如果用户已经注册过
            if (regResult.length > 0) {
                connection.end();
                return res.status(400).send({ error: "User has already registered for this event" });
            }

            // 创建注册记录
            var insertSql = "INSERT INTO registrations (event_id, user_name, user_email, tickets_purchased) VALUES (?, ?, ?, ?)";
            var params = [event_id, user_name, user_email, tickets_purchased];

            console.log(">>> SQL:", insertSql);
            console.log(">>> Params:", params);

            connection.query(insertSql, params, function(err, result) {
                connection.end();

                if (err) {
                    console.error(">>> SQL ERROR:", err.message);
                    res.status(500).send({ error: "Error while creating registration", detail: err.message });
                    return;
                } else {
                    res.status(201).send({
                        message: "Registration created successfully",
                        registrationId: result.insertId,
                        eventTitle: eventResult[0].title
                    });
                }
            });
        });
    });
});

module.exports = router;