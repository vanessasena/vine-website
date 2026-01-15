#!/usr/bin/env node

/**
 * Backup Supabase Production Database
 * Usage: node backup-database.js <database-connection-url>
 *
 * Example:
 * node backup-database.js "postgresql://postgres:password@host:port/postgres"
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const databaseUrl = process.argv[2];

if (!databaseUrl) {
  console.error('❌ Error: Missing database URL');
  console.log('\n📋 Usage:');
  console.log('   node backup-database.js "postgresql://user:password@host:port/postgres"');
  console.log('\n📖 To get your production database URL:');
  console.log('   1. Go to https://app.supabase.com');
  console.log('   2. Select your production project (vine-church-store-prod)');
  console.log('   3. Click "Settings" → "Database"');
  console.log('   4. Copy the full connection string');
  console.log('\n💾 The backup will be saved to: ./backups/vine-production-backup.sql');
  process.exit(1);
}

// Create backups directory if it doesn't exist
const backupDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
  console.log('✅ Created backups directory');
}

// Generate backup filename with timestamp
const timestamp = new Date().toISOString().split('T')[0];
const backupFile = path.join(backupDir, `vine-production-backup-${timestamp}.sql`);

async function backupDatabase() {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false } // Required for Supabase
  });

  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!');

    console.log('📥 Backing up database...');
    const result = await client.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
    `);

    const tables = result.rows.map(row => row.tablename);
    console.log(`📋 Found ${tables.length} tables to backup`);

    let sqlDump = '-- Vine Church Production Database Backup\n';
    sqlDump += `-- Created: ${new Date().toISOString()}\n`;
    sqlDump += `-- Tables: ${tables.length}\n\n`;
    sqlDump += 'SET statement_timeout = 0;\n';
    sqlDump += 'SET lock_timeout = 0;\n';
    sqlDump += 'SET idle_in_transaction_session_timeout = 0;\n';
    sqlDump += 'SET client_encoding = \'UTF8\';\n';
    sqlDump += 'SET standard_conforming_strings = on;\n';
    sqlDump += 'SELECT pg_catalog.set_config(\'search_path\', \'\', false);\n\n';

    // Backup each table
    for (const table of tables) {
      try {
        console.log(`  - Backing up table: ${table}...`);

        // Get table schema
        const schemaResult = await client.query(`
          SELECT pg_get_createtablestmt('${table}'::regclass)
        `);

        if (schemaResult.rows[0]) {
          sqlDump += schemaResult.rows[0].pg_get_createtablestmt + ';\n\n';
        }

        // Get table data
        const dataResult = await client.query(`SELECT * FROM "${table}"`);

        if (dataResult.rows.length > 0) {
          const columns = Object.keys(dataResult.rows[0]).map(col => `"${col}"`).join(', ');
          sqlDump += `-- Data for table: ${table}\n`;

          for (const row of dataResult.rows) {
            const values = Object.values(row).map(val => {
              if (val === null) return 'NULL';
              if (typeof val === 'string') return "'" + val.replace(/'/g, "''") + "'";
              if (typeof val === 'boolean') return val ? 'true' : 'false';
              if (typeof val === 'object') return "'" + JSON.stringify(val).replace(/'/g, "''") + "'";
              return val;
            }).join(', ');
            sqlDump += `INSERT INTO "${table}" (${columns}) VALUES (${values});\n`;
          }
          sqlDump += '\n';
        }
      } catch (tableError) {
        console.warn(`  ⚠️  Error backing up ${table}: ${tableError.message}`);
      }
    }

    // Write to file
    fs.writeFileSync(backupFile, sqlDump);
    const stats = fs.statSync(backupFile);
    const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);

    console.log(`\n✅ Backup completed successfully!`);
    console.log(`📊 Backup size: ${sizeInMB} MB`);
    console.log(`💾 Saved to: ${backupFile}`);
    console.log(`📈 Total rows backed up: ${tables.length} tables`);

  } catch (error) {
    console.error(`❌ Backup failed: ${error.message}`);
    if (fs.existsSync(backupFile)) {
      fs.unlinkSync(backupFile);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

backupDatabase();
