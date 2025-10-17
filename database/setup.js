const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// MySQL连接配置（不使用数据库名，用于创建数据库）
const initDbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306
};

// 数据库名称
const dbName = process.env.DB_NAME || 'charityevents_db';

// SQL文件路径
const schemaPath = path.join(__dirname, 'charityevents_db.sql');

async function setupDatabase() {
    let connection;
    
    try {
        console.log('正在连接到MySQL服务器...');
        
        // 创建初始连接（不指定数据库）
        connection = await mysql.createConnection(initDbConfig);
        
        // 检查数据库是否存在
        const [databases] = await connection.execute(
            'SHOW DATABASES LIKE ?', 
            [dbName]
        );
        
        if (databases.length > 0) {
            console.log(`数据库 ${dbName} 已存在，正在删除...`);
            await connection.execute(`DROP DATABASE ${dbName}`);
            console.log('数据库已删除');
        }
        
        // 创建新数据库
        console.log(`正在创建数据库 ${dbName}...`);
        await connection.execute(`CREATE DATABASE ${dbName}`);
        console.log('数据库创建成功');
        
        // 使用新数据库
        await connection.execute(`USE ${dbName}`);
        
        // 读取SQL文件
        console.log('正在读取SQL文件...');
        const sqlContent = fs.readFileSync(schemaPath, 'utf8');
        
        // 分割SQL命令（按分号分割，但忽略在引号内的分号）
        const commands = sqlContent.split(/;(?=(?:[^'"]*['"][^'"]*['"])*[^'"]*$)/);
        
        // 执行每个SQL命令
        for (let command of commands) {
            command = command.trim();
            if (command && !command.startsWith('--') && !command.startsWith('/*')) {
                try {
                    await connection.execute(command);
                    console.log('执行SQL命令成功');
                } catch (error) {
                    console.error('执行SQL命令失败:', error.message);
                    // 继续执行下一个命令，不中断整个过程
                }
            }
        }
        
        console.log('数据库初始化完成！');
        
        // 验证数据
        const [events] = await connection.execute('SELECT COUNT(*) as event_count FROM charity_events');
        const [categories] = await connection.execute('SELECT COUNT(*) as category_count FROM event_categories');
        
        console.log(`成功创建 ${events[0].event_count} 个示例活动`);
        console.log(`成功创建 ${categories[0].category_count} 个活动分类`);
        
        console.log('\n✅ 数据库设置完成！');
        console.log('现在可以启动服务器：npm start');
        
    } catch (error) {
        console.error('数据库设置失败:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('数据库连接已关闭');
        }
    }
}

// 执行设置
if (require.main === module) {
    setupDatabase();
}

module.exports = { setupDatabase };