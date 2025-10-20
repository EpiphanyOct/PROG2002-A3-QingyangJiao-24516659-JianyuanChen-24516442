var dbDetails = require("./db_details.js");
var mysql = require('mysql2');
var bodyParser = require('body-parser');
var http = require('http');

module.exports = {
    getconnection: ()=>{
        return mysql.createConnection({
            host:dbDetails.host,
            port:dbDetails.port,
            user:dbDetails.user,
            password:dbDetails.password,
            database:dbDetails.database
        });
    }
}