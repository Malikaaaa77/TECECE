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

// Get all members
const getMembers = async (req, res) => {
  try {
    const members = await postgres.query(
      `SELECT m.id, m.nim, m.full_name, m.email, m.department, m.year_joined, m.status,
              u.username, u.role, u.last_login
       FROM members m
       LEFT JOIN users u ON m.id = u.member_id
       ORDER BY m.created_at DESC`
    );

    res.json({
      success: true,
      data: members.rows
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get members'
    });
  }
};

// Update member status
const updateMemberStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "active" or "inactive"'
      });
    }

    await postgres.query(
      'UPDATE members SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, id]
    );

    res.json({
      success: true,
      message: `Member status updated to ${status}`
    });
  } catch (error) {
    console.error('Update member status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update member status'
    });
  }
};

// Delete member
const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete user first (foreign key constraint)
    await postgres.query('DELETE FROM users WHERE member_id = $1', [id]);
    
    // Then delete member
    await postgres.query('DELETE FROM members WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Member deleted successfully'
    });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete member'
    });
  }
};

// Get all transactions
const getTransactions = async (req, res) => {
  try {
    const [transactions] = await mysql.execute(
      `SELECT * FROM transactions ORDER BY created_at DESC LIMIT 100`
    );

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transactions'
    });
  }
};

// Add transaction
const addTransaction = async (req, res) => {
  try {
    const { type, amount, description } = req.body;
    const adminId = req.session.user.id;
    const memberId = req.session.user.memberId;

    const transactionId = `TRX${Date.now()}`;

    await mysql.execute(
      `INSERT INTO transactions (transaction_id, member_id, transaction_type, amount, description, status, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, 'approved', ?, NOW())`,
      [transactionId, memberId, type, amount, description, adminId]
    );

    res.json({
      success: true,
      message: 'Transaction added successfully',
      data: { transactionId }
    });
  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add transaction'
    });
  }
};

// Update transaction
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description } = req.body;

    await mysql.execute(
      'UPDATE transactions SET amount = ?, description = ?, updated_at = NOW() WHERE id = ?',
      [amount, description, id]
    );

    res.json({
      success: true,
      message: 'Transaction updated successfully'
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update transaction'
    });
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    await mysql.execute('DELETE FROM transactions WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete transaction'
    });
  }
};

// Get pending payments
const getPendingPayments = async (req, res) => {
  return getPendingApprovals(req, res); // Alias
};

// Reject payment
const rejectPayment = async (req, res) => {
  req.body.action = 'reject';
  return approvePayment(req, res);
};

module.exports = {
  getDashboard,
  getPendingApprovals,
  approvePayment,
  addExpense,
  getMembers,
  updateMemberStatus,
  deleteMember,
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getPendingPayments,
  rejectPayment
};