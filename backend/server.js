// server.js
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
require('dotenv').config();

const app = express();

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'himakeu_session_secret_2025',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // set true untuk HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true
  }
}));

// File upload middleware
app.use(fileUpload({
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  abortOnLimit: true,
  createParentPath: true,
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const db = require('./config/database');

// Test database connections
db.testConnections();

// Routes
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.error('❌ Failed to load auth routes:', error.message);
}

try {
  const memberRoutes = require('./routes/member');
  app.use('/api/member', memberRoutes);
  console.log('✅ Member routes loaded');
} catch (error) {
  console.error('❌ Failed to load member routes:', error.message);
}

try {
  const adminRoutes = require('./routes/admin');
  app.use('/api/admin', adminRoutes);
  console.log('✅ Admin routes loaded');
} catch (error) {
  console.error('❌ Failed to load admin routes:', error.message);
}

try {
  const transactionRoutes = require('./routes/transaction');
  app.use('/api/transaction', transactionRoutes);
  console.log('✅ Transaction routes loaded');
} catch (error) {
  console.error('❌ Failed to load transaction routes:', error.message);
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await db.healthCheck();
    res.json({
      status: 'OK',
      message: 'Himakeu Finance API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      databases: dbStatus
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Test endpoints (temporary)
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!', 
    session: req.session.id,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('🚀 Himakeu Finance Backend Server Started');
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`🔗 CORS enabled for: http://localhost:5000`);
});