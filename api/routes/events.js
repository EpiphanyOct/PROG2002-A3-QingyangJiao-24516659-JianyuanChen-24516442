const express = require('express');
const router = express.Router();
const { query, get } = require('../event_db');
const { param, query, validationResult } = require('express-validator');

// 错误处理中间件
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg,
                value: err.value
            }))
        });
    }
    next();
};

// 获取所有活动状态的活动（用于首页）
router.get('/', async (req, res) => {
    try {
        const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        const sql = `
            SELECT 
                ce.id, ce.name, ce.short_description, ce.event_date, ce.end_date,
                ce.location, ce.ticket_price, ce.max_attendees, ce.current_attendees,
                ce.fundraising_goal, ce.current_raised, ce.image_url,
                ec.name as category_name, ec.icon_class,
                os.name as organization_name,
                es.status_name
            FROM charity_events ce
            LEFT JOIN event_categories ec ON ce.category_id = ec.id
            LEFT JOIN organizations os ON ce.organization_id = os.id
            LEFT JOIN event_status es ON ce.status_id = es.id
            WHERE ce.status_id IN (1, 2, 3) 
            AND ce.event_date >= DATE_SUB(?, INTERVAL 1 DAY)
            ORDER BY ce.event_date ASC
        `;
        
        const events = await query(sql, [currentDate]);
        
        res.json({
            success: true,
            data: events,
            count: events.length
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch events'
        });
    }
});

// 搜索活动
router.get('/search', [
    query('date').optional().isDate().withMessage('Date must be a valid date format (YYYY-MM-DD)'),
    query('location').optional().isString().isLength({ min: 2, max: 100 }).withMessage('Location must be between 2 and 100 characters'),
    query('category').optional().isInt({ min: 1 }).withMessage('Category must be a valid integer'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { date, location, category } = req.query;
        let conditions = [];
        let params = [];
        
        // 基础条件：只显示活跃和即将举行的活动
        conditions.push('ce.status_id IN (1, 2)');
        
        // 日期过滤
        if (date) {
            conditions.push('DATE(ce.event_date) = ?');
            params.push(date);
        }
        
        // 位置过滤
        if (location) {
            conditions.push('ce.location LIKE ?');
            params.push(`%${location}%`);
        }
        
        // 分类过滤
        if (category && category !== 'all') {
            conditions.push('ce.category_id = ?');
            params.push(category);
        }
        
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        
        const sql = `
            SELECT 
                ce.id, ce.name, ce.short_description, ce.event_date, ce.end_date,
                ce.location, ce.ticket_price, ce.max_attendees, ce.current_attendees,
                ce.fundraising_goal, ce.current_raised, ce.image_url,
                ec.name as category_name, ec.icon_class,
                os.name as organization_name,
                es.status_name
            FROM charity_events ce
            LEFT JOIN event_categories ec ON ce.category_id = ec.id
            LEFT JOIN organizations os ON ce.organization_id = os.id
            LEFT JOIN event_status es ON ce.status_id = es.id
            ${whereClause}
            ORDER BY ce.event_date ASC
        `;
        
        const events = await query(sql, params);
        
        res.json({
            success: true,
            data: events,
            count: events.length,
            filters: { date, location, category }
        });
    } catch (error) {
        console.error('Error searching events:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search events'
        });
    }
});

// 获取单个活动详情
router.get('/:id', [
    param('id').isInt({ min: 1 }).withMessage('Event ID must be a positive integer'),
    handleValidationErrors
], async (req, res) => {
    try {
        const eventId = req.params.id;
        
        // 获取活动基本信息
        const eventSql = `
            SELECT 
                ce.*,
                ec.name as category_name, ec.icon_class,
                os.name as organization_name,
                os.description as organization_description,
                os.mission_statement,
                os.contact_email as org_contact_email,
                os.contact_phone as org_contact_phone,
                os.website_url as org_website_url,
                es.status_name
            FROM charity_events ce
            LEFT JOIN event_categories ec ON ce.category_id = ec.id
            LEFT JOIN organizations os ON ce.organization_id = os.id
            LEFT JOIN event_status es ON ce.status_id = es.id
            WHERE ce.id = ?
        `;
        
        const event = await get(eventSql, [eventId]);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        
        // 获取活动标签
        const tagsSql = `
            SELECT et.id, et.name, et.color_code
            FROM event_tags et
            INNER JOIN event_tag_relations etr ON et.id = etr.tag_id
            WHERE etr.event_id = ?
        `;
        
        const tags = await query(tagsSql, [eventId]);
        
        // 计算进度百分比
        const progressPercentage = event.fundraising_goal > 0 
            ? Math.round((event.current_raised / event.fundraising_goal) * 100)
            : 0;
        
        // 计算剩余名额
        const remainingSpots = event.max_attendees 
            ? event.max_attendees - (event.current_attendees || 0)
            : null;
        
        res.json({
            success: true,
            data: {
                ...event,
                tags,
                progress_percentage: progressPercentage,
                remaining_spots: remainingSpots
            }
        });
    } catch (error) {
        console.error('Error fetching event details:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch event details'
        });
    }
});

// 获取即将举行的活动（首页特色）
router.get('/featured/upcoming', async (req, res) => {
    try {
        const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        const sql = `
            SELECT 
                ce.id, ce.name, ce.short_description, ce.event_date, ce.end_date,
                ce.location, ce.ticket_price, ce.max_attendees, ce.current_attendees,
                ce.fundraising_goal, ce.current_raised, ce.image_url,
                ec.name as category_name, ec.icon_class,
                os.name as organization_name
            FROM charity_events ce
            LEFT JOIN event_categories ec ON ce.category_id = ec.id
            LEFT JOIN organizations os ON ce.organization_id = os.id
            WHERE ce.status_id = 1 
            AND ce.event_date > ?
            ORDER BY ce.event_date ASC
            LIMIT 6
        `;
        
        const events = await query(sql, [currentDate]);
        
        res.json({
            success: true,
            data: events,
            count: events.length
        });
    } catch (error) {
        console.error('Error fetching upcoming events:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch upcoming events'
        });
    }
});

module.exports = router;