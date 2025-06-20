// middleware/auth.js
const db = require('../config/database');

// Check if user is authenticated via session
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please login first.'
    });
  }
  
  // Make user accessible as req.user for consistency
  req.user = req.session.user;
  next();
};

// Check if user has specific role
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login first.'
      });
    }

    if (req.session.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${role} role required.`
      });
    }

    // Make user accessible as req.user
    req.user = req.session.user;
    next();
  };
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  return requireRole('admin')(req, res, next);
};

// Check if user is member  
const requireMember = (req, res, next) => {
  return requireRole('member')(req, res, next);
};

// Optional auth - doesn't fail if not authenticated
const optionalAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
  }
  next();
};

// Default auth middleware (session-based, bukan JWT)
const auth = (req, res, next) => {
  return requireAuth(req, res, next);
};

module.exports = {
  requireAuth,
  requireRole,
  requireAdmin,
  requireMember,
  optionalAuth,
  auth // Default ke session-based
};

// For backward compatibility - export default as requireAuth
module.exports = requireAuth;
module.exports.requireAuth = requireAuth;
module.exports.requireRole = requireRole;
module.exports.requireAdmin = requireAdmin;
module.exports.requireMember = requireMember;
module.exports.optionalAuth = optionalAuth;
module.exports.auth = requireAuth; // Alias