-- Schema-only dump of the `user_information` database (no data).
-- Regenerated from the live dev DB; bootstraps local + e2e databases.

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `user_information` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `user_information`;
DROP TABLE IF EXISTS `account_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_info` (
  `username` varchar(20) NOT NULL,
  `user_email` varchar(256) NOT NULL,
  `password` varchar(256) NOT NULL,
  PRIMARY KEY (`username`),
  UNIQUE KEY `account_info_user_email_uindex` (`user_email`),
  UNIQUE KEY `account_info_username_uindex` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `money_account_updates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `money_account_updates` (
  `account_id` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `amount` decimal(10,2) DEFAULT '0.00',
  `update_id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`update_id`),
  KEY `money_account_updates_money_accounts_account_id_fk` (`account_id`),
  CONSTRAINT `money_account_updates_money_accounts_account_id_fk` FOREIGN KEY (`account_id`) REFERENCES `money_accounts` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `money_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `money_accounts` (
  `account_id` varchar(36) NOT NULL,
  `username` varchar(20) NOT NULL,
  `account_name` varchar(50) NOT NULL,
  `is_fixed` tinyint(1) DEFAULT '1',
  `type` varchar(10) NOT NULL DEFAULT 'CHECKING',
  `growth_rate` float NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`account_id`),
  UNIQUE KEY `Money_Accounts_account_id_uindex` (`account_id`),
  KEY `money_accounts_account_info_username_fk` (`username`),
  CONSTRAINT `money_accounts_account_info_username_fk` FOREIGN KEY (`username`) REFERENCES `account_info` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `recurring_spending`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recurring_spending` (
  `recurring_spend_id` varchar(36) NOT NULL,
  `username` varchar(20) NOT NULL,
  `category` varchar(30) DEFAULT NULL,
  `spend_name` varchar(30) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `is_variable_recurring` tinyint(1) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`recurring_spend_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `recurring_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recurring_transactions` (
  `recurring_spend_id` varchar(36) NOT NULL,
  `transaction_amount` decimal(10,2) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  UNIQUE KEY `transaction_id` (`transaction_id`),
  UNIQUE KEY `recurring_spend_id` (`recurring_spend_id`,`date`),
  CONSTRAINT `recurring_transactions_ibfk_1` FOREIGN KEY (`recurring_spend_id`) REFERENCES `recurring_spending` (`recurring_spend_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `spend_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spend_transactions` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(20) DEFAULT NULL,
  `category` varchar(30) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `uncommon` tinyint(1) NOT NULL DEFAULT '0',
  `is_custom_category` tinyint(1) DEFAULT '0',
  `date` date NOT NULL,
  `note` varchar(60) DEFAULT NULL,
  `linked_trip_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`transaction_id`),
  UNIQUE KEY `spend_transactions_transaction_id_uindex` (`transaction_id`),
  KEY `spend_transactions_account_info_username_fk` (`username`),
  CONSTRAINT `spend_transactions_account_info_username_fk` FOREIGN KEY (`username`) REFERENCES `account_info` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `trips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trips` (
  `trip_id` varchar(36) NOT NULL,
  `username` varchar(20) NOT NULL,
  `trip_name` varchar(30) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  PRIMARY KEY (`trip_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

