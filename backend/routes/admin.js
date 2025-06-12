// routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(requireAuth);
router.use(requireAdmin);

// Admin dashboard
router.get('/dashboard', adminController.getDashboard);

// Payment approvals
router.get('/pending-approvals', adminController.getPendingApprovals);
router.post('/approve-payment', adminController.approvePayment);

// Expense management
router.post('/add-expense', adminController.addExpense);

module.exports = router;