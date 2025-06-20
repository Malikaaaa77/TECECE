// controllers/authController.js
const bcrypt = require('bcryptjs');
const { postgres } = require('../config/database');

// Register new member
const register = async (req, res) => {
  try {
    console.log('📝 Registration request:', req.body);
    
    const { name, nim, email, faculty, batch, password, role = 'member' } = req.body;

    // Validation
    if (!name || !nim || !email || !faculty || !batch || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        missing_fields: {
          name: !name,
          nim: !nim,
          email: !email,
          faculty: !faculty,
          batch: !batch,
          password: !password
        }
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await postgres.query(
      'SELECT id FROM members WHERE email = $1 OR nim = $2',
      [email, nim]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or NIM already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert into PostgreSQL (members table)
    const memberResult = await postgres.query(
      `INSERT INTO members (nim, full_name, email, department, year_joined, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, 'active', NOW()) 
       RETURNING id`,
      [nim, name, email, faculty, batch]
    );

    const memberId = memberResult.rows[0].id;

    // Insert into users table for authentication
    await postgres.query(
      `INSERT INTO users (member_id, username, password_hash, role, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [memberId, email, hashedPassword, role]
    );

    console.log('✅ User registered successfully:', name);

    res.status(201).json({
      success: true,
      message: 'Registration successful! You can now login.',
      user: {
        id: memberId,
        name,
        email,
        nim,
        faculty,
        batch,
        role
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// User login
// backend/controllers/authController.js
const login = async (req, res) => {
  try {
    console.log('📨 Login request received:', req.body);
    
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Debug: Show all users first
    console.log('🔍 Checking database for users...');
    const allUsersResult = await postgres.query('SELECT username, role FROM users');
    console.log('👥 All users:', allUsersResult.rows);

    // Find user
    console.log('🔍 Looking for user:', email.trim());
    const userResult = await postgres.query(
      'SELECT * FROM users WHERE username = $1',
      [email.trim()]
    );

    console.log('👤 Query result:', userResult.rows.length, 'users found');

    if (userResult.rows.length === 0) {
      console.log('❌ User not found in database');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = userResult.rows[0];
    console.log('👤 Found user:', {
      id: user.id,
      username: user.username,
      role: user.role,
      hasPasswordHash: !!user.password_hash,
      passwordHashLength: user.password_hash?.length
    });

    // Check password
    console.log('🔑 Comparing passwords...');
    console.log('🔑 Input password:', password);
    console.log('🔑 Stored hash:', user.password_hash?.substring(0, 20) + '...');

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('🔑 Password comparison result:', isValidPassword);

    if (!isValidPassword) {
      console.log('❌ Password mismatch');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await postgres.query(
      'UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE id = $1',
      [user.id]
    );

    console.log('✅ Login successful for:', user.username);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.username,
        email: user.username,
        nim: user.member_id,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// User logout
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  });
};

// Get current user profile
const getProfile = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  res.json({
    success: true,
    user: req.session.user
  });
};

module.exports = {
  register,
  login,
  logout,
  getProfile
};

