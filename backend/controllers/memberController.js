// controllers/memberController.js
const { mysql, postgres } = require('../config/database');
const path = require('path');

// Get member dashboard data
const getDashboard = async (req, res) => {
  try {
    const memberId = req.session.user.memberId;

    // Get member dues status from MySQL
    const [duesStatus] = await mysql.execute(
      `SELECT period, amount, status, due_date, paid_date
       FROM member_dues
       WHERE member_id = ?
       ORDER BY period DESC
       LIMIT 6`,
      [memberId]
    );

    // Get total paid amount
    const [totalPaid] = await mysql.execute(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM transactions
       WHERE member_id = ? AND transaction_type = 'income' AND status = 'approved'`,
      [memberId]
    );

    // Get general financial transparency info
    const [cashSummary] = await mysql.execute(
      `SELECT 
         COALESCE(SUM(CASE WHEN transaction_type = 'income' AND status = 'approved' THEN amount ELSE 0 END), 0) as total_income,
         COALESCE(SUM(CASE WHEN transaction_type = 'expense' AND status = 'approved' THEN amount ELSE 0 END), 0) as total_expense
       FROM transactions`
    );

    const totalIncome = parseFloat(cashSummary[0].total_income) || 0;
    const totalExpense = parseFloat(cashSummary[0].total_expense) || 0;
    const currentBalance = totalIncome - totalExpense;

    res.json({
      success: true,
      data: {
        member: req.session.user.member,
        duesStatus: duesStatus || [],
        totalPaid: parseFloat(totalPaid[0].total) || 0,
        transparency: {
          currentBalance,
          totalIncome,
          totalExpense
        }
      }
    });

  } catch (error) {
    console.error('Member dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard'
    });
  }
};

// Upload payment proof
const uploadPaymentProof = async (req, res) => {
  try {
    if (!req.files || !req.files.receipt) {
      return res.status(400).json({
        success: false,
        message: 'Receipt file is required'
      });
    }

    const memberId = req.session.user.memberId;
    const { description = '', period } = req.body;
    const receiptFile = req.files.receipt;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(receiptFile.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Only image files (JPG, PNG) are allowed'
      });
    }

    // Validate file size (max 2MB)
    if (receiptFile.size > 2 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File size must be less than 2MB'
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = path.extname(receiptFile.name);
    const filename = `receipt_${memberId}_${timestamp}${extension}`;
    const uploadPath = path.join(__dirname, '../uploads/receipts', filename);

    // Move file to uploads directory
    await receiptFile.mv(uploadPath);

    // Generate transaction ID
    const transactionId = `TRX${Date.now()}`;

    // Insert transaction record
    await mysql.execute(
      `INSERT INTO transactions (transaction_id, member_id, transaction_type, amount, description, 
                                receipt_url, status, created_by, created_at, updated_at)
       VALUES (?, ?, 'income', 50000, ?, ?, 'pending', ?, NOW(), NOW())`,
      [
        transactionId,
        memberId,
        `Iuran ${period} - ${description}`.trim(),
        `/uploads/receipts/${filename}`,
        memberId
      ]
    );

    res.json({
      success: true,
      message: 'Payment proof uploaded successfully. Waiting for admin approval.',
      data: {
        transactionId,
        filename
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed. Please try again.'
    });
  }
};

// Get payment history
const getPaymentHistory = async (req, res) => {
  try {
    const memberId = req.session.user.memberId;

    const [history] = await mysql.execute(
      `SELECT transaction_id, amount, description, status, receipt_url, 
              created_at, approved_at, notes
       FROM transactions
       WHERE member_id = ? AND transaction_type = 'income'
       ORDER BY created_at DESC`,
      [memberId]
    );

    res.json({
      success: true,
      data: history
    });

  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load payment history'
    });
  }
};

module.exports = {
  getDashboard,
  uploadPaymentProof,
  getPaymentHistory
};