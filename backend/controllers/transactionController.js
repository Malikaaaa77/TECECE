const db = require('../config/database');

const transactionController = {
  // Get all transactions
  getTransactions: async (req, res) => {
    try {
      if (req.session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const [transactions] = await db.mysql.execute(`
        SELECT * FROM transactions 
        ORDER BY created_at DESC 
        LIMIT 50
      `);

      res.json({ transactions });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ 
        message: 'Failed to get transactions',
        error: error.message 
      });
    }
  },

  // Add new transaction
  addTransaction: async (req, res) => {
    try {
      if (req.session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const { type, amount, description, category } = req.body;

      if (!type || !amount || !description) {
        return res.status(400).json({ 
          message: 'Type, amount, and description are required' 
        });
      }

      const [result] = await db.mysql.execute(`
        INSERT INTO transactions (type, amount, description, category, created_by, created_at) 
        VALUES (?, ?, ?, ?, ?, NOW())
      `, [type, amount, description, category || 'general', req.session.user.id]);

      res.status(201).json({
        message: 'Transaction added successfully',
        transaction_id: result.insertId
      });
    } catch (error) {
      console.error('Add transaction error:', error);
      res.status(500).json({ 
        message: 'Failed to add transaction',
        error: error.message 
      });
    }
  },

  // Get transaction by ID
  getTransactionById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const [transactions] = await db.mysql.execute(`
        SELECT * FROM transactions WHERE id = ?
      `, [id]);

      if (transactions.length === 0) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      res.json({ transaction: transactions[0] });
    } catch (error) {
      console.error('Get transaction error:', error);
      res.status(500).json({ 
        message: 'Failed to get transaction',
        error: error.message 
      });
    }
  },

  // Update transaction
  updateTransaction: async (req, res) => {
    try {
      if (req.session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const { id } = req.params;
      const { type, amount, description, category } = req.body;

      const [result] = await db.mysql.execute(`
        UPDATE transactions 
        SET type = ?, amount = ?, description = ?, category = ?, updated_at = NOW() 
        WHERE id = ?
      `, [type, amount, description, category, id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      res.json({ message: 'Transaction updated successfully' });
    } catch (error) {
      console.error('Update transaction error:', error);
      res.status(500).json({ 
        message: 'Failed to update transaction',
        error: error.message 
      });
    }
  },

  // Delete transaction
  deleteTransaction: async (req, res) => {
    try {
      if (req.session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const { id } = req.params;

      const [result] = await db.mysql.execute(`
        DELETE FROM transactions WHERE id = ?
      `, [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
      console.error('Delete transaction error:', error);
      res.status(500).json({ 
        message: 'Failed to delete transaction',
        error: error.message 
      });
    }
  },

  // Get monthly summary
  getMonthlySummary: async (req, res) => {
    try {
      const { year, month } = req.query;
      const currentYear = year || new Date().getFullYear();
      const currentMonth = month || new Date().getMonth() + 1;

      const [summary] = await db.mysql.execute(`
        SELECT 
          type,
          SUM(amount) as total,
          COUNT(*) as count
        FROM transactions 
        WHERE YEAR(created_at) = ? AND MONTH(created_at) = ?
        GROUP BY type
      `, [currentYear, currentMonth]);

      res.json({ summary });
    } catch (error) {
      console.error('Monthly summary error:', error);
      res.status(500).json({ 
        message: 'Failed to get monthly summary',
        error: error.message 
      });
    }
  },

  // Get yearly summary
  getYearlySummary: async (req, res) => {
    try {
      const { year } = req.query;
      const currentYear = year || new Date().getFullYear();

      const [summary] = await db.mysql.execute(`
        SELECT 
          MONTH(created_at) as month,
          type,
          SUM(amount) as total
        FROM transactions 
        WHERE YEAR(created_at) = ?
        GROUP BY MONTH(created_at), type
        ORDER BY MONTH(created_at)
      `, [currentYear]);

      res.json({ summary });
    } catch (error) {
      console.error('Yearly summary error:', error);
      res.status(500).json({ 
        message: 'Failed to get yearly summary',
        error: error.message 
      });
    }
  }
};

module.exports = transactionController;