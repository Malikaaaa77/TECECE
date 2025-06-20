// config/database.js - Dual Database Version
const mysql = require('mysql2/promise');
const { Pool } = require('pg');

// MySQL Configuration - Sesuaikan nama variable
const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '', // Kosong sesuai setup Anda
  database: process.env.MYSQL_DATABASE || 'himakeu_transactions', // Fixed: MYSQL_DATABASE bukan MYSQL_DB
  port: process.env.MYSQL_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// PostgreSQL Configuration - Sesuaikan nama variable  
const postgresConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'admin123', // Sesuai setup Anda
  database: process.env.POSTGRES_DATABASE || 'himakeu_master', // Fixed: POSTGRES_DATABASE bukan POSTGRES_DB
  port: process.env.POSTGRES_PORT || 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
};

// Debug log untuk memastikan kredensial benar
console.log('🔧 Database Configuration:');
console.log('MySQL:', {
  host: mysqlConfig.host,
  user: mysqlConfig.user,
  password: mysqlConfig.password ? '***' : '(empty)',
  database: mysqlConfig.database
});
console.log('PostgreSQL:', {
  host: postgresConfig.host,
  user: postgresConfig.user,
  password: postgresConfig.password ? '***' : '(empty)',
  database: postgresConfig.database
});

// Create MySQL connection pool
const mysqlPool = mysql.createPool(mysqlConfig);

// Create PostgreSQL connection pool
const postgresPool = new Pool(postgresConfig);

// Test connections
const testConnections = async () => {
  console.log('📊 Testing database connections...');
  
  try {
    console.log('🔍 Testing MySQL (Transactions)...');
    const mysqlConnection = await mysqlPool.getConnection();
    await mysqlConnection.ping();
    mysqlConnection.release();
    console.log('✅ MySQL connected successfully (Transactions Database)');
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    console.log('💡 Check: MySQL server running? Database exists? User has access?');
  }

  try {
    console.log('🔍 Testing PostgreSQL (Master Data)...');
    const client = await postgresPool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ PostgreSQL connected successfully (Master Data Database)');
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    console.log('💡 Check: PostgreSQL server running? Database exists? Password correct?');
  }

  console.log('🏗️  Architecture: MySQL (Transactions) + PostgreSQL (Master Data)');
};

// Health check function
const healthCheck = async () => {
  const status = {
    mysql: false,
    postgres: false
  };

  try {
    const mysqlConnection = await mysqlPool.getConnection();
    await mysqlConnection.ping();
    mysqlConnection.release();
    status.mysql = true;
  } catch (error) {
    status.mysql = false;
  }

  try {
    const client = await postgresPool.connect();
    await client.query('SELECT NOW()');
    client.release();
    status.postgres = true;
  } catch (error) {
    status.postgres = false;
  }

  return status;
};

module.exports = {
  mysql: mysqlPool,
  postgres: postgresPool,
  testConnections,
  healthCheck
};