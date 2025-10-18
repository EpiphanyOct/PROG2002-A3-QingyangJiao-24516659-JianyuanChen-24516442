
SET FOREIGN_KEY_CHECKS=0;


DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `events`;
CREATE TABLE `events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `event_date` date DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `status` enum('Active','Past','Suspended') NOT NULL DEFAULT 'Active',
  -- Optional fields for the Weather API bonus task.
  -- Uncomment these lines if you plan to implement the weather feature.
  -- `latitude` decimal(10,8) DEFAULT NULL,
  -- `longitude` decimal(11,8) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `registrations`;
CREATE TABLE `registrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(11) NOT NULL,
  `user_name` varchar(100) NOT NULL,
  `user_email` varchar(100) NOT NULL,
  `registration_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `tickets_purchased` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`),
  -- This UNIQUE KEY ensures a user can only register once for a specific event.
  UNIQUE KEY `unique_event_user` (`event_id`,`user_email`),
  CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Re-enable foreign key checks after tables are created.
SET FOREIGN_KEY_CHECKS=1;



INSERT INTO `categories` VALUES (1, 'Community Support');
INSERT INTO `categories` VALUES (2, 'Education');
INSERT INTO `categories` VALUES (3, 'Health & Wellness');
INSERT INTO `categories` VALUES (4, 'Environmental');


INSERT INTO `events` VALUES (1, 'Coastal Cleanup Drive', 'Join us for a day of cleaning our beautiful beaches to protect marine life.', '2025-11-15', 'Sunshine Beach', 4, 'Active');
INSERT INTO `events` VALUES (2, 'Coding Workshop for Kids', 'A fun and interactive workshop to introduce children to the world of programming.', '2025-10-25', 'City Library', 2, 'Active');
INSERT INTO `events` VALUES (3, 'Annual Charity Run', 'Run for a cause! All proceeds go to local health initiatives.', '2025-09-20', 'Riverside Park', 3, 'Past');
INSERT INTO `events` VALUES (4, 'Food Bank Volunteer Day', 'Help us sort and pack food for families in need.', '2025-12-01', 'Central Community Center', 1, 'Active');
INSERT INTO `events` VALUES (5, 'Tree Planting Initiative', 'Help make our city greener by planting trees in the urban park.', '2025-11-05', 'Westside Park', 4, 'Active');


INSERT INTO `registrations` (`event_id`, `user_name`, `user_email`, `tickets_purchased`) VALUES (1, 'Alice Johnson', 'alice.j@email.com', 2);
INSERT INTO `registrations` (`event_id`, `user_name`, `user_email`, `tickets_purchased`) VALUES (1, 'Bob Williams', 'bob.williams@email.com', 1);
INSERT INTO `registrations` (`event_id`, `user_name`, `user_email`, `tickets_purchased`) VALUES (1, 'Charlie Brown', 'charlie.b@email.com', 3);
INSERT INTO `registrations` (`event_id`, `user_name`, `user_email`, `tickets_purchased`) VALUES (2, 'Diana Prince', 'diana.p@email.com', 1);
INSERT INTO `registrations` (`event_id`, `user_name`, `user_email`, `tickets_purchased`) VALUES (2, 'Ethan Hunt', 'e.hunt@email.com', 2);
INSERT INTO `registrations` (`event_id`, `user_name`, `user_email`, `tickets_purchased`) VALUES (3, 'Fiona Glenanne', 'fiona.g@email.com', 1);
INSERT INTO `registrations` (`event_id`, `user_name`, `user_email`, `tickets_purchased`) VALUES (4, 'George Costanza', 'george.c@email.com', 4);
INSERT INTO `registrations` (`event_id`, `user_name`, `user_email`, `tickets_purchased`) VALUES (4, 'Hannah Abbott', 'hannah.a@email.com', 2);
INSERT INTO `registrations` (`event_id`, `user_name`, `user_email`, `tickets_purchased`) VALUES (5, 'Ian Malcolm', 'i.malcolm@email.com', 1);
INSERT INTO `registrations` (`event_id`, `user_name`, `user_email`, `tickets_purchased`) VALUES (5, 'Jane Doe', 'jane.doe@email.com', 1);

INSERT INTO `registrations` (`event_id`, `user_name`, `user_email`, `tickets_purchased`) VALUES (2, 'Alice Johnson', 'alice.j@email.com', 1);
