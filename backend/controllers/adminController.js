// controllers/adminController.js
const { mysql, postgres } = require('../config/database');

// Get admin dashboard data
const getDashboard = async (req, res) => {
  try {
    // Financial summary
    const [financialSummary] = await mysql.execute(
      `SELECT 
         COALESCE(SUM(CASE WHEN transaction_type = 'income' AND status = 'approved' THEN amount ELSE 0 END), 0) as total_income,
         COALESCE(SUM(CASE WHEN transaction_type = 'expense' AND status = 'approved' THEN amount ELSE 0 END), 0) as total_expense,
         COALESCE(SUM(CASE WHEN transaction_type = 'income' AND status = 'approved' AND MONTH(created_at) = MONTH(NOW()) THEN amount ELSE 0 END), 0) as monthly_income,
         COALESCE(SUM(CASE WHEN transaction_type = 'expense' AND status = 'approved' AND MONTH(created_at) = MONTH(NOW()) THEN amount ELSE 0 END), 0) as monthly_expense
       FROM transactions`
    );

    // Pending approvals count
    const [pendingCount] = await mysql.execute(
      `SELECT COUNT(*) as count FROM transactions WHERE status = 'pending'`
    );

    // Member statistics
    const memberStats = await postgres.query(
      `SELECT 
         COUNT(*) as total_members,
         COUNT(CASE WHEN status = 'active' THEN 1 END) as active_members
       FROM members`
    );

    const summary = financialSummary[0];
    const currentBalance = parseFloat(summary.total_income) - parseFloat(summary.total_expense);

    res.json({
      success: true,
      data: {
        financial: {
          currentBalance,
          totalIncome: parseFloat(summary.total_income),
          totalExpense: parseFloat(summary.total_expense),
          monthlyIncome: parseFloat(summary.monthly_income),
          monthlyExpense: parseFloat(summary.monthly_expense)
        },
        pendingApprovals: pendingCount[0].count,
        memberStats: memberStats.rows[0]
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load admin dashboard'
    });
  }
};

// Get pending payment approvals
const getPendingApprovals = async (req, res) => {
  try {
    // Get pending payments with member info
    const [pendingPayments] = await mysql.execute(
      `SELECT t.id, t.transaction_id, t.member_id, t.amount, t.description, 
              t.receipt_url, t.created_at
       FROM transactions t
       WHERE t.status = 'pending' AND t.transaction_type = 'income'
       ORDER BY t.created_at ASC`
    );

    // Get member names from PostgreSQL
    if (pendingPayments.length > 0) {
      const memberIds = pendingPayments.map(p => p.member_id);
      const placeholders = memberIds.map((_, index) => `$${index + 1}`).join(', ');
      
      const members = await postgres.query(
        `SELECT id, full_name, nim FROM members WHERE id IN (${placeholders})`,
        memberIds
      );

      // Combine data
      const paymentsWithMembers = pendingPayments.map(payment => ({
        ...payment,
        member: members.rows.find(m => m.id === payment.member_id)
      }));

      res.json({
        success: true,
        data: paymentsWithMembers
      });
    } else {
      res.json({
        success: true,
        data: []
      });
    }

  } catch (error) {
    console.error('Pending approvals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load pending approvals'
    });
  }
};

// Approve or reject payment
const approvePayment = async (req, res) => {
  try {
    const { transactionId, action, notes = '' } = req.body;
    const adminId = req.session.user.id;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be "approve" or "reject"'
      });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    // Update transaction
    await mysql.execute(
      `UPDATE transactions 
       SET status = ?, notes = ?, approved_by = ?, approved_at = NOW(), updated_at = NOW()
       WHERE transaction_id = ?`,
      [newStatus, notes, adminId, transactionId]
    );

    res.json({
      success: true,
      message: `Payment ${action}d successfully`
    });

  } catch (error) {
    console.error('Approve payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment approval'
    });
  }
};

// Add expense transaction
const addExpense = async (req, res) => {
  try {
    const { amount, description, categoryId } = req.body;
    const adminId = req.session.user.id;
    const memberId = req.session.user.memberId;

    if (!amount || !description) {
      return res.status(400).json({
        success: false,
        message: 'Amount and description are required'
      });
    }

    // Generate transaction ID
    const transactionId = `EXP${Date.now()}`;

    // Insert expense transaction
    await mysql.execute(
      `INSERT INTO transactions (transaction_id, member_id, transaction_type, amount, 
                                description, category_id, status, created_by, approved_by, 
                                approved_at, created_at, updated_at)
       VALUES (?, ?, 'expense', ?, ?, ?, 'approved', ?, ?, NOW(), NOW(), NOW())`,
      [transactionId, memberId, amount, description, categoryId || null, adminId, adminId]
    );

    res.json({
      success: true,
      message: 'Expense added successfully',
      data: { transactionId }
    });

  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add expense'
    });
  }
};

module.exports = {
  getDashboard,
  getPendingApprovals,
  approvePayment,
  addExpense
};