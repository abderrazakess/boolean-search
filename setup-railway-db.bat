@echo off
echo ============================================================================
echo Railway Database Setup - Quick Guide
echo ============================================================================
echo.

echo Step 1: Commit and push changes
echo --------------------------------
git add -A
git commit -m "Update database configuration"
git push origin main
echo.
echo Done!
echo.

echo Step 2: Create Database Tables
echo --------------------------------
echo Run these commands:
echo.
echo   railway service MySQL
echo   railway connect
echo.
echo Then paste this SQL:
echo.
type NUL > temp_sql.txt
echo CREATE TABLE IF NOT EXISTS users ( >> temp_sql.txt
echo   `id` int AUTO_INCREMENT NOT NULL, >> temp_sql.txt
echo   `openId` varchar(64) NOT NULL, >> temp_sql.txt
echo   `name` text, >> temp_sql.txt
echo   `email` varchar(320), >> temp_sql.txt
echo   `loginMethod` varchar(64), >> temp_sql.txt
echo   `role` enum('user','admin') NOT NULL DEFAULT 'user', >> temp_sql.txt
echo   `createdAt` timestamp NOT NULL DEFAULT (now()), >> temp_sql.txt
echo   `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP, >> temp_sql.txt
echo   `lastSignedIn` timestamp NOT NULL DEFAULT (now()), >> temp_sql.txt
echo   CONSTRAINT `users_id` PRIMARY KEY(`id`), >> temp_sql.txt
echo   CONSTRAINT `users_openId_unique` UNIQUE(`openId`) >> temp_sql.txt
echo ); >> temp_sql.txt
type temp_sql.txt
del temp_sql.txt
echo.
echo SHOW TABLES;
echo DESCRIBE users;
echo exit
echo.

echo Step 3: After creating tables
echo --------------------------------
echo   railway service boolean-search
echo.
echo Your app will be live at:
echo   https://boolean-search-production.up.railway.app/
echo.
pause
