# Railway Database Setup Guide

## The Problem
Railway's MySQL has connection permission issues when accessed from the app service. The root user is denied access from certain network addresses.

## Solution: Create Tables Manually via Railway Console

### Step 1: Connect to MySQL via Railway CLI

```bash
# Switch to MySQL service
railway service MySQL

# Connect to MySQL console
railway connect
```

### Step 2: Create the Database Tables

Once connected, run this SQL:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openId VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify table was created
SHOW TABLES;

-- Check table structure
DESCRIBE users;

-- Exit MySQL
exit
```

### Step 3: Deploy Your App

```bash
# Switch back to your app service
railway service boolean-search

# App will now start without migration errors
```

---

## Alternative: Link Services in Railway Dashboard

If you want automatic DATABASE_URL sharing:

1. Go to Railway Dashboard
2. Click on `boolean-search` service
3. Go to "Settings" → "Variables"
4. Delete the current `DATABASE_URL` variable
5. Click "+ New Variable" → "Add Reference"
6. Select: `MySQL` service → `MYSQL_URL` variable
7. This creates: `DATABASE_URL=${{MySQL.MYSQL_URL}}`

This ensures the services are properly linked on Railway's private network.

---

## Running Your App After Manual Setup

Once tables are created manually, your app will start successfully without needing migrations.

You can re-enable auto-migrations later by changing `package.json`:

```json
"start": "npm run migrate && node dist/index.js"
```

But only after fixing the MySQL permissions issue with Railway support.
