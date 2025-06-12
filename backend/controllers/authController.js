// controllers/authController.js
const bcrypt = require('bcryptjs');
const { postgres } = require('../config/database');

// Register new member
const register = async (req, res) => {
  try {
    const {
      nim, fullName, email, phone, department,
      yearJoined, username, password
    } = req.body;

    // Basic validation
    if (!nim || !fullName || !email || !department || !yearJoined || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be filled'
      });
    }

    // Check if NIM already exists
    const nimCheck = await postgres.query(
      'SELECT id FROM members WHERE nim = $1',
      [nim]
    );

    if (nimCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'NIM already registered'
      });
    }

    // Check if email already exists
    const emailCheck = await postgres.query(
      'SELECT id FROM members WHERE email = $1',
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Check if username already exists
    const usernameCheck = await postgres.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (usernameCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert member first
    const memberResult = await postgres.query(
      `INSERT INTO members (nim, full_name, email, phone, department, year_joined, status, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, 'active', NOW(), NOW()) RETURNING id`,
      [nim, fullName, email, phone, department, yearJoined]
    );

    const memberId = memberResult.rows[0].id;

    // Insert user (always as 'member' role)
    await postgres.query(
      `INSERT INTO users (member_id, username, password_hash, role, created_at, updated_at) 
       VALUES ($1, $2, $3, 'member', NOW(), NOW())`,
      [memberId, username, passwordHash]
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please login with your credentials.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

// User login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Get user with member data
    const result = await postgres.query(
      `SELECT u.id, u.member_id, u.username, u.password_hash, u.role,
              m.nim, m.full_name, m.email, m.department, m.year_joined
       FROM users u
       JOIN members m ON u.member_id = m.id
       WHERE u.username = $1 AND m.status = 'active'`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Update last login
    await postgres.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Store user in session
    req.session.user = {
      id: user.id,
      memberId: user.member_id,
      username: user.username,
      role: user.role,
      member: {
        nim: user.nim,
        fullName: user.full_name,
        email: user.email,
        department: user.department,
        yearJoined: user.year_joined
      }
    };

    res.json({
      success: true,
      message: 'Login successful',
      user: req.session.user
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
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