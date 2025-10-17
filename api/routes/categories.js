var express = require('express');
var router = express.Router();
var dbcon = require("../event_db.js");
var connection = dbcon.getconnection();

connection.connect();

// 获取所有类别
router.get("/", function(req, res) {
    var sql = "SELECT * FROM categories";
    connection.query(sql, function(err, records, fields) {
        if (err) {
            console.error("Error while retrieving categories:", err);
            res.status(500).send({ error: "Error while retrieving categories" });
        } else {
            res.send(records);
        }
    });
});

module.exports = router;