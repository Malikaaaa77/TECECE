// routes/transaction.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Import auth middleware
const { requireAuth } = require('../middleware/auth');

// Apply auth middleware
router.use(requireAuth);

// Transaction routes
router.get('/', transactionController.getTransactions);
router.post('/', transactionController.addTransaction);
router.get('/:id', transactionController.getTransactionById);
router.put('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

// Transaction summary routes
router.get('/summary/monthly', transactionController.getMonthlySummary);
router.get('/summary/yearly', transactionController.getYearlySummary);

module.exports = router;