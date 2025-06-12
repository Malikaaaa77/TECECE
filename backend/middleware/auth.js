// middleware/auth.js

// Check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please login first.'
    });
  }
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
  // Just pass through, controller can check req.session.user if needed
  next();
};

module.exports = {
  requireAuth,
  requireRole,
  requireAdmin,
  requireMember,
  optionalAuth
};