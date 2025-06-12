// routes/member.js
const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { requireAuth, requireMember } = require('../middleware/auth');

// All member routes require authentication and member role
router.use(requireAuth);
router.use(requireMember);

// Member dashboard
router.get('/dashboard', memberController.getDashboard);

// Payment management
router.post('/upload-payment', memberController.uploadPaymentProof);
router.get('/payment-history', memberController.getPaymentHistory);

module.exports = router;