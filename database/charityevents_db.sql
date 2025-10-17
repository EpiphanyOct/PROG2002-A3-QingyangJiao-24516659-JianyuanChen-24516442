-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: charityevents_db
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Fun Run','Charity run events'),(2,'Gala Dinner','Formal dinner events'),(3,'Silent Auction','Auction events'),(4,'Concert','Music events');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `date` datetime NOT NULL,
  `location` varchar(255) NOT NULL,
  `category_id` int DEFAULT NULL,
  `goal` decimal(10,2) DEFAULT NULL,
  `progress` decimal(10,2) DEFAULT '0.00',
  `ticket_price` decimal(10,2) DEFAULT NULL,
  `status` enum('upcoming','past','suspended') DEFAULT 'upcoming',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (1,'City Marathon 2025','Annual charity marathon to raise funds for children education','2025-10-15 08:00:00','City Park',1,50000.00,0.00,50.00,'upcoming','2025-10-04 03:47:12'),(2,'Charity Gala Night','Elegant dinner with auction to support medical research','2025-11-20 19:00:00','Grand Hotel',2,100000.00,0.00,150.00,'upcoming','2025-10-04 03:47:12'),(3,'Art for Hope Auction','Silent auction featuring local artists','2025-09-30 18:00:00','Art Gallery',3,30000.00,0.00,0.00,'upcoming','2025-10-04 03:47:12'),(4,'Rock for Relief Concert','Music concert supporting disaster relief efforts','2025-12-05 20:00:00','City Arena',4,75000.00,0.00,75.00,'upcoming','2025-10-04 03:47:12'),(5,'Kids Fun Run','Short distance run for children and families','2025-10-20 09:00:00','Community Center',1,20000.00,0.00,20.00,'upcoming','2025-10-04 03:47:12'),(6,'Winter Gala','Seasonal fundraising dinner','2025-12-15 18:30:00','Country Club',2,80000.00,0.00,120.00,'upcoming','2025-10-04 03:47:12'),(7,'Vintage Wine Auction','Auction of rare wines','2025-11-10 19:00:00','Wine Estate',3,40000.00,0.00,100.00,'upcoming','2025-10-04 03:47:12'),(8,'Jazz Night','Jazz concert supporting music education','2025-10-25 19:30:00','Jazz Club',4,25000.00,0.00,60.00,'upcoming','2025-10-04 03:47:12');
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-04 12:54:41
