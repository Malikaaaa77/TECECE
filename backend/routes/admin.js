// routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Import auth middleware
const { requireAdmin } = require('../middleware/auth');

// Apply admin auth middleware ke semua routes
router.use(requireAdmin);

// Admin routes
router.get('/dashboard', adminController.getDashboard);
router.get('/members', adminController.getMembers);
router.put('/members/:id/status', adminController.updateMemberStatus);
router.delete('/members/:id', adminController.deleteMember);
router.get('/transactions', adminController.getTransactions);
router.post('/transactions', adminController.addTransaction);
router.put('/transactions/:id', adminController.updateTransaction);
router.delete('/transactions/:id', adminController.deleteTransaction);
router.get('/payments/pending', adminController.getPendingPayments);
router.put('/payments/:id/approve', adminController.approvePayment);
router.put('/payments/:id/reject', adminController.rejectPayment);

module.exports = router;