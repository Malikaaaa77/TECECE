// server.js
const app = require('./app');
const { testConnections } = require('./config/database');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Test database connections
    const dbConnected = await testConnections();
    
    if (!dbConnected) {
      console.log('⚠️  Warning: Database connection failed, but server will start anyway');
    }

    // Start server
    app.listen(PORT, () => {
      console.log('🚀 Himakeu Finance Backend Server Started');
      console.log(`📍 Server running on: http://localhost:${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  MySQL Database: ${process.env.MYSQL_DB}`);
      console.log(`🐘 PostgreSQL Database: ${process.env.POSTGRES_DB}`);
      console.log('📊 Health check: http://localhost:' + PORT + '/api/health');
      console.log('=====================================');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Server shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🔄 Server shutting down gracefully...');
  process.exit(0);
});

startServer();