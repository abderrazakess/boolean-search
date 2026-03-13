#!/usr/bin/env node
/**
 * Simple database migration script for Railway deployment
 * Creates tables directly without drizzle-kit
 */

import mysql from 'mysql2/promise';
import 'dotenv/config';

const createUsersTable = `
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
`;

async function migrate() {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
        console.warn('⚠️  DATABASE_URL not set - skipping migration');
        console.log('ℹ️  App will run without database features');
        process.exit(0);
    }

    console.log('🔄 Starting database migration...');
    console.log('📍 Connecting to:', dbUrl.replace(/:[^:@]+@/, ':****@'));

    let connection;
    try {
        connection = await mysql.createConnection(dbUrl);
        console.log('✅ Connected to database');

        // Create users table
        console.log('📝 Creating users table...');
        await connection.execute(createUsersTable);
        console.log('✅ Users table ready');

        console.log('🎉 Migration completed successfully!');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.warn('⚠️  Migration failed:', error.message);
        if (error.code) {
            console.warn('Error code:', error.code);
        }
        console.log('ℹ️  App will start anyway. Create tables manually:');
        console.log('   railway service MySQL');
        console.log('   railway connect');
        console.log('   Then run the SQL from drizzle/0000_neat_molten_man.sql');
        if (connection) {
            await connection.end();
        }
        // Exit with 0 to allow app to start
        process.exit(0);
    }
}

migrate();
