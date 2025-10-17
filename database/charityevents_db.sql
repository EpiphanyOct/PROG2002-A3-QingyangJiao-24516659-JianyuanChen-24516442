-- PROG2002 A2 Assessment - Charity Events Database Schema
-- MySQL Database Schema for Charity Events Management System

-- 创建数据库
CREATE DATABASE IF NOT EXISTS charityevents_db;
USE charityevents_db;

-- 慈善组织表
CREATE TABLE organizations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    mission_statement TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    website_url VARCHAR(255),
    logo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 活动分类表
CREATE TABLE event_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_class VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 活动状态枚举
CREATE TABLE event_status (
    id INT PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- 插入活动状态
INSERT INTO event_status (id, status_name, description) VALUES 
(1, 'upcoming', '即将举行的活动'),
(2, 'active', '正在进行的活动'),
(3, 'past', '已结束的活动'),
(4, 'suspended', '已暂停的活动'),
(5, 'cancelled', '已取消的活动');

-- 慈善活动表
CREATE TABLE charity_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT,
    category_id INT,
    status_id INT DEFAULT 1,
    name VARCHAR(255) NOT NULL,
    short_description TEXT,
    full_description LONGTEXT,
    event_date DATETIME NOT NULL,
    end_date DATETIME,
    location VARCHAR(255) NOT NULL,
    venue_details TEXT,
    ticket_price DECIMAL(10,2) DEFAULT 0.00,
    max_attendees INT,
    current_attendees INT DEFAULT 0,
    fundraising_goal DECIMAL(12,2) DEFAULT 0.00,
    current_raised DECIMAL(12,2) DEFAULT 0.00,
    image_url VARCHAR(255),
    registration_deadline DATETIME,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    website_url VARCHAR(255),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES event_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (status_id) REFERENCES event_status(id) ON DELETE SET NULL
);

-- 活动标签表
CREATE TABLE event_tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    color_code VARCHAR(7) DEFAULT '#6B7280',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 活动标签关联表
CREATE TABLE event_tag_relations (
    event_id INT,
    tag_id INT,
    PRIMARY KEY (event_id, tag_id),
    FOREIGN KEY (event_id) REFERENCES charity_events(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES event_tags(id) ON DELETE CASCADE
);

-- 用户注册表
CREATE TABLE registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT,
    participant_name VARCHAR(255) NOT NULL,
    participant_email VARCHAR(255) NOT NULL,
    participant_phone VARCHAR(20),
    ticket_quantity INT DEFAULT 1,
    donation_amount DECIMAL(10,2) DEFAULT 0.00,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    FOREIGN KEY (event_id) REFERENCES charity_events(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX idx_charity_events_status ON charity_events(status_id);
CREATE INDEX idx_charity_events_date ON charity_events(event_date);
CREATE INDEX idx_charity_events_category ON charity_events(category_id);
CREATE INDEX idx_charity_events_organization ON charity_events(organization_id);
CREATE INDEX idx_registrations_event ON registrations(event_id);

-- 插入示例数据

-- 插入慈善组织
INSERT INTO organizations (name, description, mission_statement, contact_email, contact_phone, website_url) VALUES 
('Hope for Tomorrow Foundation', '致力于改善社区教育和医疗条件的慈善组织', '为每个人创造更美好的明天，通过教育和医疗改变生活', 'contact@hopefortomorrow.org', '+61 2 9876 5432', 'https://hopefortomorrow.org'),
('Green Future Initiative', '专注于环境保护和可持续发展的非营利组织', '保护我们的地球，为子孙后代创造一个绿色未来', 'info@greenfuture.org', '+61 3 1234 5678', 'https://greenfuture.org'),
('Community Care Network', '为弱势群体提供支持和服务的社区组织', '建立更强大的社区，让每个人都能得到关爱和支持', 'hello@communitycare.org', '+61 7 9012 3456', 'https://communitycare.org');

-- 插入活动分类
INSERT INTO event_categories (name, description, icon_class) VALUES 
('Gala Dinner', '正式的慈善晚宴活动', 'fas fa-utensils'),
('Fun Run', '趣味跑步和步行活动', 'fas fa-running'),
('Silent Auction', '无声拍卖筹款活动', 'fas fa-gavel'),
('Concert', '慈善音乐会和表演', 'fas fa-music'),
('Workshop', '教育和培训工作坊', 'fas fa-chalkboard-teacher'),
('Community Event', '社区聚会和活动', 'fas fa-users'),
('Sports Tournament', '体育比赛和锦标赛', 'fas fa-trophy'),
('Art Exhibition', '艺术展览和文化活动', 'fas fa-palette');

-- 插入活动标签
INSERT INTO event_tags (name, color_code) VALUES 
('Family Friendly', '#10B981'),
('Outdoor', '#3B82F6'),
('Indoor', '#8B5CF6'),
('Free Entry', '#059669'),
('Premium', '#DC2626'),
('Virtual', '#7C3AED'),
('Weekend', '#F59E0B'),
('Evening', '#EF4444');

-- 插入示例慈善活动
INSERT INTO charity_events (
    organization_id, category_id, status_id, name, short_description, full_description,
    event_date, end_date, location, venue_details, ticket_price, max_attendees,
    fundraising_goal, current_raised, image_url, registration_deadline, contact_email
) VALUES 
(1, 1, 1, 'Annual Charity Gala 2025', 'Join us for an elegant evening of fine dining and fundraising', '我们的年度慈善晚宴将汇集社区领袖、慈善家和关心社会的人士，共同为我们的教育项目筹集资金。活动包括正式晚宴、现场拍卖、特别嘉宾演讲和娱乐表演。所有收益将直接用于支持贫困地区的教育基础设施建设。', '2025-11-15 18:00:00', '2025-11-15 23:00:00', 'Sydney Opera House', 'Grand Ballroom, Sydney Opera House, Bennelong Point, Sydney NSW 2000', 150.00, 200, 50000.00, 12500.00, 'https://example.com/images/gala-2025.jpg', '2025-11-10 23:59:59', 'gala@hopefortomorrow.org'),

(2, 2, 1, 'Green Future Fun Run', '5K run to raise awareness for environmental protection', '加入我们的5公里趣味跑步活动，为环境保护意识筹集资金。路线穿越城市公园和绿地，适合所有年龄段的参与者。活动包括T恤、奖牌、健康零食和环保教育展览。让我们用脚步为地球的未来奔跑！', '2025-10-25 08:00:00', '2025-10-25 12:00:00', 'Centennial Park, Sydney', 'Centennial Parklands, Grand Drive, Randwick NSW 2031', 25.00, 500, 15000.00, 3500.00, 'https://example.com/images/fun-run-2025.jpg', '2025-10-20 23:59:59', 'run@greenfuture.org'),

(3, 3, 2, 'Community Art Auction', 'Silent auction featuring local artists work', '支持本地艺术家和社区艺术项目的无声拍卖活动。展出来自新兴和知名艺术家的50多件艺术作品，包括绘画、雕塑和摄影作品。所有艺术品都可用于拍卖，收益将支持社区艺术教育和本地艺术家的发展。', '2025-10-10 14:00:00', '2025-10-10 18:00:00', 'Sydney Town Hall', 'Lower Town Hall, 483 George Street, Sydney NSW 2000', 0.00, 300, 25000.00, 8000.00, 'https://example.com/images/art-auction-2025.jpg', '2025-10-08 23:59:59', 'auction@communitycare.org'),

(1, 4, 1, 'Voices of Hope Concert', 'Benefit concert featuring local musicians', '一场充满希望的慈善音乐会，汇集了悉尼地区最有才华的本地音乐家。演出包括古典音乐、爵士乐和流行音乐表演。所有表演者都是志愿参与，门票收入全部用于支持我们的儿童教育项目。', '2025-11-20 19:30:00', '2025-11-20 22:30:00', 'City Recital Hall', 'City Recital Hall, 2 Angel Place, Sydney NSW 2000', 45.00, 400, 20000.00, 5500.00, 'https://example.com/images/concert-2025.jpg', '2025-11-18 23:59:59', 'concert@hopefortomorrow.org'),

(2, 6, 3, 'Eco Workshop Series', 'Learn practical skills for sustainable living', '为期一天的环保生活技能工作坊，包括有机园艺、废物减量、能源节约和可持续时尚等主题。专家讲师将分享实用技巧和知识，帮助参与者在日常生活中做出更环保的选择。', '2025-09-20 09:00:00', '2025-09-20 17:00:00', 'Royal Botanic Gardens', 'The Calyx, Royal Botanic Gardens, Mrs Macquaries Road, Sydney NSW 2000', 35.00, 80, 8000.00, 7200.00, 'https://example.com/images/eco-workshop.jpg', '2025-09-18 23:59:59', 'workshop@greenfuture.org'),

(3, 7, 1, 'Community Sports Day', 'Family-friendly sports tournament and games', '家庭友好的社区体育活动日，包括足球比赛、篮球锦标赛、儿童游戏区和健康生活方式展览。活动旨在促进社区凝聚力，同时为社区体育中心筹集资金。适合所有年龄段的家庭参与。', '2025-11-02 10:00:00', '2025-11-02 16:00:00', 'Prince Alfred Park', 'Prince Alfred Park, Chalmers Street, Surry Hills NSW 2010', 15.00, 600, 12000.00, 2800.00, 'https://example.com/images/sports-day.jpg', '2025-10-30 23:59:59', 'sports@communitycare.org'),

(1, 8, 1, 'Young Artists Exhibition', 'Showcasing artwork from underprivileged youth', '展示来自贫困地区青少年的艺术作品，包括绘画、手工艺和数字艺术。这次展览不仅展示了年轻艺术家的才华，还为他们提供了艺术教育资金支持。参观者可以购买艺术品，直接支持年轻艺术家的未来发展。', '2025-12-05 10:00:00', '2025-12-05 18:00:00', 'Sydney Art Gallery', 'Contemporary Art Space, 123 George Street, Sydney NSW 2000', 10.00, 250, 15000.00, 3200.00, 'https://example.com/images/youth-art.jpg', '2025-12-01 23:59:59', 'art@hopefortomorrow.org'),

(2, 5, 1, 'Sustainable Fashion Show', 'Fashion show promoting eco-friendly clothing', '可持续时尚时装秀，展示使用环保材料和道德生产方式的本地设计师作品。活动包括时装表演、设计师讲座和可持续时尚市场。收益将支持环保时尚教育和本地可持续时尚产业的发展。', '2025-11-30 15:00:00', '2025-11-30 18:00:00', 'Carriageworks', 'Carriageworks, 245 Wilson Street, Eveleigh NSW 2015', 30.00, 350, 18000.00, 4200.00, 'https://example.com/images/fashion-show.jpg', '2025-11-25 23:59:59', 'fashion@greenfuture.org');

-- 为活动添加标签关联
INSERT INTO event_tag_relations (event_id, tag_id) VALUES 
(1, 5), (1, 8),  -- Gala Dinner: Premium, Evening
(2, 1), (2, 2), (2, 7),  -- Fun Run: Family Friendly, Outdoor, Weekend
(3, 1), (3, 6),  -- Art Auction: Family Friendly, Virtual
(4, 1), (4, 8),  -- Concert: Family Friendly, Evening
(5, 1), (5, 2), (5, 7),  -- Eco Workshop: Family Friendly, Outdoor, Weekend
(6, 1), (6, 2), (6, 7),  -- Sports Day: Family Friendly, Outdoor, Weekend
(7, 1), (7, 6),  -- Youth Art: Family Friendly, Virtual
(8, 1), (8, 7), (8, 8);  -- Fashion Show: Family Friendly, Weekend, Evening

-- 插入一些示例注册数据
INSERT INTO registrations (event_id, participant_name, participant_email, participant_phone, ticket_quantity, donation_amount, status) VALUES 
(1, 'John Smith', 'john.smith@email.com', '+61 4 1234 5678', 2, 50.00, 'confirmed'),
(1, 'Sarah Johnson', 'sarah.j@email.com', '+61 4 2345 6789', 1, 25.00, 'confirmed'),
(2, 'Mike Brown', 'mike.brown@email.com', '+61 4 3456 7890', 1, 10.00, 'confirmed'),
(3, 'Emily Davis', 'emily.d@email.com', '+61 4 4567 8901', 3, 0.00, 'pending'),
(4, 'David Wilson', 'david.w@email.com', '+61 4 5678 9012', 2, 30.00, 'confirmed');

-- 更新活动的当前参与人数
UPDATE charity_events SET current_attendees = 2 WHERE id = 1;
UPDATE charity_events SET current_attendees = 1 WHERE id = 2;
UPDATE charity_events SET current_attendees = 1 WHERE id = 4;

SELECT 'Database schema and sample data created successfully!' AS message;