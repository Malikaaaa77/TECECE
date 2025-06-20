// routes/member.js
const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

// Import auth middleware
const { requireAuth } = require('../middleware/auth');

// Apply auth middleware to all member routes
router.use(requireAuth);

// Member routes
router.get('/dashboard', memberController.getDashboard);
router.post('/upload-payment', memberController.uploadPaymentProof);
router.get('/payment-history', memberController.getPaymentHistory);

// Additional member routes (optional)
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    user: req.session.user
  });
});

module.exports = router;

