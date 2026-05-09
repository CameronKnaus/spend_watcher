CREATE DATABASE  IF NOT EXISTS `user_information` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `user_information`;
-- MySQL dump 10.13  Distrib 8.0.40, for macos14 (arm64)
--
-- Host: spend-watcher-db.cowia1uqsbs9.us-east-1.rds.amazonaws.com    Database: user_information
-- ------------------------------------------------------
-- Server version	8.0.35

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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

--
-- Table structure for table `account_info`
--

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

--
-- Table structure for table `money_account_updates`
--

DROP TABLE IF EXISTS `money_account_updates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `money_account_updates` (
  `account_id` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `amount` float DEFAULT '0',
  KEY `money_account_updates_money_accounts_account_id_fk` (`account_id`),
  CONSTRAINT `money_account_updates_money_accounts_account_id_fk` FOREIGN KEY (`account_id`) REFERENCES `money_accounts` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `money_accounts`
--

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
  PRIMARY KEY (`account_id`),
  UNIQUE KEY `Money_Accounts_account_id_uindex` (`account_id`),
  KEY `money_accounts_account_info_username_fk` (`username`),
  CONSTRAINT `money_accounts_account_info_username_fk` FOREIGN KEY (`username`) REFERENCES `account_info` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `recurring_spending`
--

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

--
-- Table structure for table `recurring_transactions`
--

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
) ENGINE=InnoDB AUTO_INCREMENT=726 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `spend_transactions`
--

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
) ENGINE=InnoDB AUTO_INCREMENT=2783 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `trips`
--

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

--
-- Dumping routines for database 'user_information'
--
/*!50003 DROP PROCEDURE IF EXISTS `BackfillRecurringTransactions` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE PROCEDURE `BackfillRecurringTransactions`(IN input_username VARCHAR(20))
BEGIN
    -- Declare variables
    DECLARE done INT DEFAULT FALSE;
    DECLARE recurring_id VARCHAR(36);
    DECLARE recurring_amount DECIMAL(10, 2);
    DECLARE transaction_date DATE;
    DECLARE recurring_start_date DATE;
    -- Declare the cursor for fetching recurring spending data
    DECLARE cur CURSOR FOR 
        SELECT recurring_spend_id, amount
        FROM recurring_spending 
        WHERE is_active = TRUE 
        AND is_variable_recurring = FALSE
        AND username = input_username; -- Filter by username

    -- Declare a continue handler for when no more rows are found
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    -- Open the cursor
    OPEN cur;
    -- Cursor loop to fetch and process data
    read_loop: LOOP
        FETCH cur INTO recurring_id, recurring_amount;
        -- Check if done
        IF done THEN
            LEAVE read_loop;
        END IF;
        -- Fetch the earliest transaction date for this recurring_spend_id
        SELECT MIN(date)
        INTO recurring_start_date
        FROM recurring_transactions
        WHERE recurring_spend_id = recurring_id;
        -- If no previous transaction exists, default to a specific fallback date (e.g., the start of the current month)
        IF recurring_start_date IS NULL THEN
            SET recurring_start_date = DATE_FORMAT(CURDATE(), '%Y-%m-01');
        END IF;
        -- Set transaction_date to recurring_start_date
        SET transaction_date = recurring_start_date;
        -- Loop through each month from the start_date to the current date
        WHILE transaction_date <= CURDATE() DO
            -- Check if there is already a transaction for this month
            IF NOT EXISTS (
                SELECT 1
                FROM recurring_transactions
                WHERE recurring_spend_id = recurring_id
                AND date = transaction_date
            ) THEN
                -- If the transaction is missing, insert it
                INSERT INTO recurring_transactions (recurring_spend_id, transaction_amount, date)
                VALUES (recurring_id, recurring_amount, transaction_date);
            END IF;
            -- Move to the next month
            SET transaction_date = DATE_ADD(transaction_date, INTERVAL 1 MONTH);
        END WHILE;
    END LOOP;
    -- Close the cursor
    CLOSE cur;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-11-16 16:37:32
