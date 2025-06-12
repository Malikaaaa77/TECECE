// config/database.js - Dual Database Version
const mysql = require('mysql2/promise');
const { Pool } = require('pg');
require('dotenv').config();

// MySQL Configuration (Transactions)
const mysqlConfig = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'himakeu_user',
  password: process.env.MYSQL_PASS || '',
  database: process.env.MYSQL_DB || 'himakeu_transactions',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  timezone: '+00:00' // UTC
};

// PostgreSQL Configuration (Master Data)
const postgresConfig = {
  host: process.env.POSTGRES_HOST || '127.0.0.1',
  port: process.env.POSTGRES_PORT || 5432,
  user: process.env.POSTGRES_USER || 'himakeu_user',
  password: process.env.POSTGRES_PASS || '',
  database: process.env.POSTGRES_DB || 'himakeu_master',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
};

// Create connection pools
const mysqlPool = mysql.createPool(mysqlConfig);
const postgresPool = new Pool(postgresConfig);

// Test database connections
const testConnections = async () => {
  try {
    console.log('📊 Testing database connections...');
    
    // Test MySQL (Transactions)
    console.log('🔍 Testing MySQL (Transactions)...');
    const [mysqlResult] = await mysqlPool.execute('SELECT 1 as test, "transactions" as db_purpose');
    if (mysqlResult[0].test === 1) {
      console.log('✅ MySQL connected successfully (Transactions Database)');
    }

    // Test PostgreSQL (Master Data)
    console.log('🔍 Testing PostgreSQL (Master Data)...');
    const postgresResult = await postgresPool.query('SELECT 1 as test, \'master_data\' as db_purpose');
    if (postgresResult.rows[0].test === 1) {
      console.log('✅ PostgreSQL connected successfully (Master Data Database)');
    }

    console.log('✅ All database connections established');
    console.log('🏗️  Architecture: MySQL (Transactions) + PostgreSQL (Master Data)');
    return true;

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.log('⚠️  Warning: Database connection failed, but server will start anyway');
    return false;
  }
};

// Test individual connections (untuk debugging)
const testMysqlConnection = async () => {
  try {
    const [result] = await mysqlPool.execute('SELECT NOW() as current_time, DATABASE() as database_name');
    console.log('MySQL Test:', result[0]);
    return true;
  } catch (error) {
    console.error('MySQL Test Failed:', error.message);
    return false;
  }
};

const testPostgresConnection = async () => {
  try {
    const result = await postgresPool.query('SELECT NOW() as current_time, current_database() as database_name');
    console.log('PostgreSQL Test:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('PostgreSQL Test Failed:', error.message);
    return false;
  }
};

// Graceful shutdown
const closeConnections = async () => {
  try {
    console.log('🔄 Closing database connections...');
    
    await mysqlPool.end();
    console.log('✅ MySQL connection pool closed');
    
    await postgresPool.end();
    console.log('✅ PostgreSQL connection pool closed');
    
  } catch (error) {
    console.error('Error closing connections:', error);
  }
};

// Connection health check
const healthCheck = async () => {
  const status = {
    mysql: { connected: false, latency: null },
    postgres: { connected: false, latency: null }
  };

  try {
    // MySQL health check
    const mysqlStart = Date.now();
    await mysqlPool.execute('SELECT 1');
    status.mysql = {
      connected: true,
      latency: Date.now() - mysqlStart,
      database: mysqlConfig.database
    };
  } catch (error) {
    status.mysql.error = error.message;
  }

  try {
    // PostgreSQL health check
    const postgresStart = Date.now();
    await postgresPool.query('SELECT 1');
    status.postgres = {
      connected: true,
      latency: Date.now() - postgresStart,
      database: postgresConfig.database
    };
  } catch (error) {
    status.postgres.error = error.message;
  }

  return status;
};

module.exports = {
  mysql: mysqlPool,
  postgres: postgresPool,
  testConnections,
  testMysqlConnection,
  testPostgresConnection,
  closeConnections,
  healthCheck
};