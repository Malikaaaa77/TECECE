// routes/transaction.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { mysql, postgres } = require('../config/database');

// All transaction routes require authentication
router.use(requireAuth);

// Get transaction details by ID
router.get('/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.session.user.id;
    const userRole = req.session.user.role;
    const userMemberId = req.session.user.memberId;

    // Get transaction
    const [transactions] = await mysql.execute(
      `SELECT t.*, m.full_name, m.nim 
       FROM transactions t
       LEFT JOIN members m ON t.member_id = m.id
       WHERE t.transaction_id = ?`,
      [transactionId]
    );

    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const transaction = transactions[0];

    // Check permissions
    if (userRole === 'member' && transaction.member_id !== userMemberId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: transaction
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transaction details'
    });
  }
});

// Get all transactions (admin only)
router.get('/', async (req, res) => {
  try {
    const userRole = req.session.user.role;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { page = 1, limit = 20, status, type } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params = [];

    if (status) {
      whereClause += ' WHERE t.status = ?';
      params.push(status);
    }

    if (type) {
      whereClause += whereClause ? ' AND' : ' WHERE';
      whereClause += ' t.transaction_type = ?';
      params.push(type);
    }

    // Get transactions with member info
    const [transactions] = await mysql.execute(
      `SELECT t.*, m.full_name, m.nim 
       FROM transactions t
       LEFT JOIN members m ON t.member_id = m.id
       ${whereClause}
       ORDER BY t.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const [countResult] = await mysql.execute(
      `SELECT COUNT(*) as total FROM transactions t ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transactions'
    });
  }
});

module.exports = router;