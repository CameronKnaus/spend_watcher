-- Baseline migration: snapshot of the production schema as of 2026-07-09.
-- Every statement is guarded (IF NOT EXISTS / IF EXISTS) so this migration is a
-- no-op on databases that already carry the schema (prod, existing dev) and a
-- full bootstrap on empty ones (fresh dev, e2e containers, CI). Later
-- migrations must NOT use these guards — they only exist here so pre-migration
-- databases can adopt dbmate without being rebuilt.
--
-- Tables are ordered so foreign-key parents are created before their children.

-- migrate:up
CREATE TABLE IF NOT EXISTS `account_info` (
  `username` varchar(20) NOT NULL,
  `user_email` varchar(256) NOT NULL,
  `password` varchar(256) NOT NULL,
  PRIMARY KEY (`username`),
  UNIQUE KEY `account_info_user_email_uindex` (`user_email`),
  UNIQUE KEY `account_info_username_uindex` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `money_accounts` (
  `account_id` varchar(36) NOT NULL,
  `username` varchar(20) NOT NULL,
  `account_name` varchar(50) NOT NULL,
  `is_fixed` tinyint(1) DEFAULT '1',
  `type` varchar(10) NOT NULL DEFAULT 'CHECKING',
  `growth_rate` float NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`account_id`),
  UNIQUE KEY `Money_Accounts_account_id_uindex` (`account_id`),
  KEY `money_accounts_account_info_username_fk` (`username`),
  CONSTRAINT `money_accounts_account_info_username_fk` FOREIGN KEY (`username`) REFERENCES `account_info` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `money_account_updates` (
  `account_id` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `amount` decimal(10,2) DEFAULT '0.00',
  `update_id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`update_id`),
  KEY `money_account_updates_money_accounts_account_id_fk` (`account_id`),
  CONSTRAINT `money_account_updates_money_accounts_account_id_fk` FOREIGN KEY (`account_id`) REFERENCES `money_accounts` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `recurring_spending` (
  `recurring_spend_id` varchar(36) NOT NULL,
  `username` varchar(20) NOT NULL,
  `category` varchar(30) DEFAULT NULL,
  `spend_name` varchar(30) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `is_variable_recurring` tinyint(1) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`recurring_spend_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `recurring_transactions` (
  `recurring_spend_id` varchar(36) NOT NULL,
  `transaction_amount` decimal(10,2) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  UNIQUE KEY `transaction_id` (`transaction_id`),
  UNIQUE KEY `recurring_spend_id` (`recurring_spend_id`,`date`),
  CONSTRAINT `recurring_transactions_ibfk_1` FOREIGN KEY (`recurring_spend_id`) REFERENCES `recurring_spending` (`recurring_spend_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `spend_transactions` (
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

CREATE TABLE IF NOT EXISTS `trips` (
  `trip_id` varchar(36) NOT NULL,
  `username` varchar(20) NOT NULL,
  `trip_name` varchar(30) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  PRIMARY KEY (`trip_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Procedure body is prod's, verbatim. DEFINER is stripped so ownership falls to
-- whichever user applies the migration (matches e2e/scripts/prepare-schema.mjs).
DROP PROCEDURE IF EXISTS `BackfillRecurringTransactions`;
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
END;

-- migrate:down
DROP PROCEDURE IF EXISTS `BackfillRecurringTransactions`;
DROP TABLE IF EXISTS `trips`;
DROP TABLE IF EXISTS `spend_transactions`;
DROP TABLE IF EXISTS `recurring_transactions`;
DROP TABLE IF EXISTS `recurring_spending`;
DROP TABLE IF EXISTS `money_account_updates`;
DROP TABLE IF EXISTS `money_accounts`;
DROP TABLE IF EXISTS `account_info`;
