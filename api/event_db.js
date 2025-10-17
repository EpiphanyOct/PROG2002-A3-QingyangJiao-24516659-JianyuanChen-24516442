const mysql = require('mysql2/promise');
require('dotenv').config();

// MySQL数据库配置
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'charityevents_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 测试数据库连接
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
}

// 执行查询的封装函数
async function query(sql, params = []) {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Query error:', error.message);
        throw error;
    }
}

// 执行单行查询的封装函数
async function get(sql, params = []) {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows[0] || null;
    } catch (error) {
        console.error('Get error:', error.message);
        throw error;
    }
}

// 执行插入操作的封装函数
async function insert(sql, params = []) {
    try {
        const [result] = await pool.execute(sql, params);
        return {
            insertId: result.insertId,
            affectedRows: result.affectedRows
        };
    } catch (error) {
        console.error('Insert error:', error.message);
        throw error;
    }
}

// 执行更新操作的封装函数
async function update(sql, params = []) {
    try {
        const [result] = await pool.execute(sql, params);
        return {
            affectedRows: result.affectedRows,
            changedRows: result.changedRows
        };
    } catch (error) {
        console.error('Update error:', error.message);
        throw error;
    }
}

// 执行删除操作的封装函数
async function remove(sql, params = []) {
    try {
        const [result] = await pool.execute(sql, params);
        return {
            affectedRows: result.affectedRows
        };
    } catch (error) {
        console.error('Delete error:', error.message);
        throw error;
    }
}

module.exports = {
    pool,
    testConnection,
    query,
    get,
    insert,
    update,
    remove
};