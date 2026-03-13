# ============================================================================
# Railway Database Setup Script
# Run this in a NEW PowerShell terminal
# ============================================================================

Write-Host "`n🔧 Railway Database Setup & Connection`n" -ForegroundColor Cyan

# Step 1: Commit pending changes
Write-Host "Step 1: Committing pending changes..." -ForegroundColor Yellow
git add -A
git commit -m "Update database migration configuration"
git push origin main

Write-Host "`n✅ Code pushed to GitHub`n" -ForegroundColor Green

# Step 2: Verify Railway services
Write-Host "Step 2: Checking Railway services..." -ForegroundColor Yellow
railway service boolean-search
railway status

Write-Host "`n📊 Current environment variables:" -ForegroundColor Yellow
railway variables | Select-String -Pattern "DATABASE_URL" -Context 1

# Step 3: Connect to MySQL and create tables
Write-Host "`n`nStep 3: Creating database tables...`n" -ForegroundColor Yellow
Write-Host "⚠️  You need to manually run these commands:" -ForegroundColor Red
Write-Host "`n1. Connect to MySQL:" -ForegroundColor White
Write-Host "   railway service MySQL" -ForegroundColor Cyan
Write-Host "   railway connect`n" -ForegroundColor Cyan

Write-Host "2. In the MySQL console, run this SQL:" -ForegroundColor White
Write-Host @"
CREATE TABLE IF NOT EXISTS users (
  \`id\` int AUTO_INCREMENT NOT NULL,
  \`openId\` varchar(64) NOT NULL,
  \`name\` text,
  \`email\` varchar(320),
  \`loginMethod\` varchar(64),
  \`role\` enum('user','admin') NOT NULL DEFAULT 'user',
  \`createdAt\` timestamp NOT NULL DEFAULT (now()),
  \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  \`lastSignedIn\` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT \`users_id\` PRIMARY KEY(\`id\`),
  CONSTRAINT \`users_openId_unique\` UNIQUE(\`openId\`)
);

SHOW TABLES;
DESCRIBE users;
exit
"@ -ForegroundColor Cyan

Write-Host "`n3. After creating tables, switch back to your app:" -ForegroundColor White
Write-Host "   railway service boolean-search`n" -ForegroundColor Cyan

Write-Host "`n✅ Once tables are created, your app will deploy successfully!`n" -ForegroundColor Green
Write-Host "Visit: https://boolean-search-production.up.railway.app/`n" -ForegroundColor Magenta
