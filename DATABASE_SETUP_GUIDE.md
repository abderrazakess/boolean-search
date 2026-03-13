# 🚀 Railway Database Connection & Migration Guide

## Current Status
- ✅ App service: `boolean-search` 
- ✅ MySQL service: `MySQL`
- ✅ DATABASE_URL: `${{MySQL.MYSQL_URL}}` (linked to MySQL service)
- ⚠️  Database tables: Need to be created manually

---

## 🔧 Quick Fix: Create Database Tables

Your app is configured correctly, but the MySQL user has permission restrictions. Follow these steps:

### **Step 1: Open a NEW PowerShell Terminal**

Close any existing terminals and open a fresh one in your project directory.

### **Step 2: Commit Your Changes**

```powershell
cd C:\Users\AbdeslamHannouni\Desktop\abduless\boolean-search
git add -A
git commit -m "Fix database connection and migration handling"
git push origin main
```

### **Step 3: Create Tables in Railway MySQL**

```powershell
# Connect to MySQL service
railway service MySQL

# Open MySQL console
railway connect
```

### **Step 4: Run This SQL in MySQL Console**

```sql
CREATE TABLE IF NOT EXISTS `users` (
  `id` int AUTO_INCREMENT NOT NULL,
  `openId` varchar(64) NOT NULL,
  `name` text,
  `email` varchar(320),
  `loginMethod` varchar(64),
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `users_id` PRIMARY KEY(`id`),
  CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
```

### **Step 5: Verify Table Creation**

```sql
SHOW TABLES;
DESCRIBE users;
exit
```

### **Step 6: Check Your App**

```powershell
# Switch back to app service
railway service boolean-search

# Your app should now be running!
# Visit: https://boolean-search-production.up.railway.app/
```

---

## ✅ What I Fixed

1. **Made migration non-blocking** ([migrate-db.js](migrate-db.js))
   - App now starts even if migration fails
   - Shows warnings instead of crashing
   - Provides helpful instructions

2. **Re-enabled auto-migration** ([package.json](package.json))
   - Attempts migration on every deploy
   - Won't block app startup on failure

3. **DATABASE_URL properly linked**
   - Using: `${{MySQL.MYSQL_URL}}`
   - Internal Railway network connection

---

## 🧪 Test After Setup

Once tables are created:

```powershell
# Test local connection
railway run node migrate-db.js

# Check deployment logs
railway logs

# Visit your app
start https://boolean-search-production.up.railway.app/
```

---

## 📊 Environment Variables Checklist

Make sure these are set in Railway dashboard:

- ✅ `DATABASE_URL` → `${{MySQL.MYSQL_URL}}`
- ✅ `BUILT_IN_FORGE_API_KEY` → Your OpenAI key
- ✅ `BUILT_IN_FORGE_API_URL` → `https://api.openai.com/v1`
- ✅ `JWT_SECRET` → Random secure string
- ✅ `NODE_ENV` → `production` (auto-set by Railway)

---

## 🆘 Troubleshooting

### App crashes on startup?
Check Railway logs: `railway logs`

### Tables already exist?
That's fine! The SQL uses `CREATE TABLE IF NOT EXISTS`

### Still getting permission errors?
The app will run anyway now. Database features won't work until tables are created manually.

---

## 📝 Manual Setup Option

If Railway CLI doesn't work, use the Railway Dashboard:

1. Go to: https://railway.app/project/39ead644-9ef8-46bc-9563-a976969b2384
2. Click `MySQL` service
3. Click "Data" tab
4. Click "Query" button
5. Paste the CREATE TABLE SQL
6. Click "Run"

---

**Your app is now properly configured! Just create the tables manually and you're done.** 🎉
