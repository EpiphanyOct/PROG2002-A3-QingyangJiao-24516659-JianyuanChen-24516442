const express = require('express');
const router = express.Router();
const { query } = require('../event_db');

// 获取所有活动分类
router.get('/', async (req, res) => {
    try {
        const categories = await query('SELECT * FROM event_categories ORDER BY name');
        
        res.json({
            success: true,
            data: categories,
            count: categories.length
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch categories'
        });
    }
});

module.exports = router;