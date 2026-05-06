-- MariaDB dump 10.19  Distrib 10.4.28-MariaDB, for osx10.10 (x86_64)
--
-- Host: localhost    Database: paid_system_db
-- ------------------------------------------------------
-- Server version	10.4.28-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `feature` varchar(100) DEFAULT NULL,
  `action` varchar(100) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` VALUES (1,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AITutor','ai_generation','{\"promptTokens\":73,\"candidatesTokens\":33,\"totalTokens\":185}','2026-05-04 03:35:09'),(2,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AITutor','ai_generation','{\"promptTokens\":112,\"candidatesTokens\":38,\"totalTokens\":389}','2026-05-04 03:35:19'),(3,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AITutor','ai_generation','{\"promptTokens\":73,\"candidatesTokens\":45,\"totalTokens\":377}','2026-05-04 04:47:01'),(4,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AITutor','ai_generation','{\"promptTokens\":73,\"candidatesTokens\":23,\"totalTokens\":206}','2026-05-04 05:27:09'),(6,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AITutor','ai_generation','{\"promptTokens\":73,\"candidatesTokens\":29,\"totalTokens\":201}','2026-05-04 05:49:26'),(7,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AITutor','ai_generation','{\"promptTokens\":73,\"candidatesTokens\":22,\"totalTokens\":257}','2026-05-04 06:51:16'),(8,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AITutor','ai_generation','{\"promptTokens\":73,\"candidatesTokens\":21,\"totalTokens\":266}','2026-05-04 14:43:18'),(9,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AITutor','ai_generation','{\"promptTokens\":73,\"candidatesTokens\":23,\"totalTokens\":218}','2026-05-05 00:34:16'),(10,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AITutor','ai_generation','{\"promptTokens\":73,\"candidatesTokens\":28,\"totalTokens\":213}','2026-05-05 00:56:52'),(11,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AITutor','ai_generation','{\"promptTokens\":125,\"candidatesTokens\":15,\"totalTokens\":247}','2026-05-06 12:39:55'),(12,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AITutor','ai_generation','{\"promptTokens\":73,\"candidatesTokens\":23,\"totalTokens\":201}','2026-05-06 12:47:37'),(13,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AINoteMaker','ai_generation','{\"promptTokens\":89,\"candidatesTokens\":291,\"totalTokens\":804}','2026-05-06 12:48:03'),(14,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AIQuiz','ai_generation','{\"promptTokens\":51,\"candidatesTokens\":384,\"totalTokens\":1699}','2026-05-06 12:48:27'),(15,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AIEssayWriter_Full','ai_generation','{\"promptTokens\":87,\"candidatesTokens\":538,\"totalTokens\":1112}','2026-05-06 12:49:28'),(16,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AIFlashcards','ai_generation','{\"promptTokens\":47,\"candidatesTokens\":116,\"totalTokens\":570}','2026-05-06 12:50:16'),(17,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AIStudyPlanner','ai_generation','{\"promptTokens\":44,\"candidatesTokens\":1285,\"totalTokens\":1847}','2026-05-06 12:50:41'),(18,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AICodeHelper-explain','ai_generation','{\"promptTokens\":37,\"candidatesTokens\":584,\"totalTokens\":1020}','2026-05-06 12:55:14'),(19,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AIDoubtSolver','ai_generation','{\"promptTokens\":295,\"candidatesTokens\":810,\"totalTokens\":1105}','2026-05-06 13:05:24'),(20,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AISlideGenerator','ai_generation','{\"promptTokens\":96,\"candidatesTokens\":433,\"totalTokens\":970}','2026-05-06 13:05:42'),(21,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'SmartStudyMode-youtube','ai_generation','{\"promptTokens\":459,\"candidatesTokens\":1282,\"totalTokens\":4528}','2026-05-06 13:06:55'),(22,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'ZenPathAI-SkillGap','ai_generation','{\"promptTokens\":316,\"candidatesTokens\":0,\"totalTokens\":508}','2026-05-06 13:08:41'),(23,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'CareerRoadmapGenerator','ai_generation','{\"promptTokens\":310,\"candidatesTokens\":1011,\"totalTokens\":1720}','2026-05-06 13:09:21'),(24,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'SmartResources','ai_generation','{\"promptTokens\":146,\"candidatesTokens\":747,\"totalTokens\":1871}','2026-05-06 13:10:50'),(25,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AIDiagramGenerator','ai_generation','{\"promptTokens\":188,\"candidatesTokens\":293,\"totalTokens\":1785}','2026-05-06 13:22:46'),(26,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AITutor','ai_generation','{\"promptTokens\":73,\"candidatesTokens\":15,\"totalTokens\":190}','2026-05-06 13:31:57'),(27,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AIQuiz','ai_generation','{\"promptTokens\":51,\"candidatesTokens\":304,\"totalTokens\":1321}','2026-05-06 13:33:59'),(28,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AITutor','ai_generation','{\"promptTokens\":73,\"candidatesTokens\":23,\"totalTokens\":208}','2026-05-06 13:45:36'),(29,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AITutor','ai_generation','{\"promptTokens\":102,\"candidatesTokens\":36,\"totalTokens\":284}','2026-05-06 13:46:09'),(30,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AITutor','ai_generation','{\"promptTokens\":73,\"candidatesTokens\":15,\"totalTokens\":216}','2026-05-06 14:10:12'),(31,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AINoteMaker','ai_generation','{\"promptTokens\":90,\"candidatesTokens\":294,\"totalTokens\":897}','2026-05-06 14:10:26'),(32,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AIQuiz','ai_generation','{\"promptTokens\":51,\"candidatesTokens\":549,\"totalTokens\":1363}','2026-05-06 14:10:48'),(33,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AIFlashcards','ai_generation','{\"promptTokens\":47,\"candidatesTokens\":126,\"totalTokens\":649}','2026-05-06 14:11:45'),(34,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AITutor','ai_generation','{\"promptTokens\":73,\"candidatesTokens\":23,\"totalTokens\":247}','2026-05-06 14:25:28'),(35,'jUU8MJeHxOe0J3uSFbMYDUOprTg1',NULL,'AIStudyPlanner','ai_generation','{\"promptTokens\":42,\"candidatesTokens\":1128,\"totalTokens\":1830}','2026-05-06 14:26:02');
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `api_usage`
--

DROP TABLE IF EXISTS `api_usage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `api_usage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `prompt_tokens` int(11) DEFAULT 0,
  `completion_tokens` int(11) DEFAULT 0,
  `total_tokens` int(11) DEFAULT 0,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `api_usage`
--

LOCK TABLES `api_usage` WRITE;
/*!40000 ALTER TABLE `api_usage` DISABLE KEYS */;
/*!40000 ALTER TABLE `api_usage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login_logs`
--

DROP TABLE IF EXISTS `login_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `login_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `userAgent` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `uid` (`uid`),
  CONSTRAINT `login_logs_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `users` (`uid`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_logs`
--

LOCK TABLES `login_logs` WRITE;
/*!40000 ALTER TABLE `login_logs` DISABLE KEYS */;
INSERT INTO `login_logs` VALUES (1,'jUU8MJeHxOe0J3uSFbMYDUOprTg1','asifikbalmamun220@gmail.com','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','2026-05-03 18:14:57'),(2,'xJ71fEPvZ6gZJLkQI6gxKsfLOpA2','mdasifikbal688@gmail.com','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','2026-05-04 15:23:06'),(3,'jUU8MJeHxOe0J3uSFbMYDUOprTg1','asifikbalmamun220@gmail.com','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','2026-05-05 00:46:29'),(4,'jUU8MJeHxOe0J3uSFbMYDUOprTg1','asifikbalmamun220@gmail.com','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','2026-05-05 00:46:59'),(5,'jUU8MJeHxOe0J3uSFbMYDUOprTg1','asifikbalmamun220@gmail.com','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','2026-05-05 00:51:27'),(6,'jUU8MJeHxOe0J3uSFbMYDUOprTg1','asifikbalmamun220@gmail.com','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','2026-05-05 00:56:48');
/*!40000 ALTER TABLE `login_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subscriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `planId` varchar(50) DEFAULT NULL,
  `interval_period` varchar(20) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `paymentMethod` varchar(50) DEFAULT NULL,
  `transactionId` varchar(100) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `uid` (`uid`),
  CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `users` (`uid`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptions`
--

LOCK TABLES `subscriptions` WRITE;
/*!40000 ALTER TABLE `subscriptions` DISABLE KEYS */;
INSERT INTO `subscriptions` VALUES (1,'xJ71fEPvZ6gZJLkQI6gxKsfLOpA2',NULL,'pro','month',NULL,'manual','can5jHX4Gt1Rvw2nHy6K','2026-05-04 15:25:15');
/*!40000 ALTER TABLE `subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `support_tickets`
--

DROP TABLE IF EXISTS `support_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `support_tickets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `status` enum('open','closed') DEFAULT 'open',
  `reply` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_tickets`
--

LOCK TABLES `support_tickets` WRITE;
/*!40000 ALTER TABLE `support_tickets` DISABLE KEYS */;
/*!40000 ALTER TABLE `support_tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `system_settings` (
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES ('maintenance_mode','false'),('total_api_limit','1000000');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `uid` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `displayName` varchar(255) DEFAULT NULL,
  `photoURL` text DEFAULT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('active','banned') DEFAULT 'active',
  `referral_code` varchar(50) DEFAULT NULL,
  `referred_by` varchar(255) DEFAULT NULL,
  `referral_earnings` int(11) DEFAULT 0,
  PRIMARY KEY (`uid`),
  UNIQUE KEY `referral_code` (`referral_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('jUU8MJeHxOe0J3uSFbMYDUOprTg1','asifikbalmamun220@gmail.com','Asif Ikbal','https://lh3.googleusercontent.com/a/ACg8ocJu-4dZltqoDZCAgzwzlV1gIs2MOTVB0y06qyg2aQOakr--iH4R=s96-c','user','2026-05-03 18:14:57','active',NULL,NULL,0),('xJ71fEPvZ6gZJLkQI6gxKsfLOpA2','mdasifikbal688@gmail.com','Md Asif Ikbal','https://lh3.googleusercontent.com/a/ACg8ocImshHSBJz_e3kxSJhKndQtIB8vkL9l0Q6WlDZAvzxHV5bBj-4=s96-c','user','2026-05-04 15:23:05','active','mdasifikbal6888838',NULL,0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-06 21:24:37
