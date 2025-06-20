const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const auth = require('../middleware/auth');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/receipts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `receipt_${Date.now()}_${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (jpeg, jpg, png) and PDF files are allowed'));
    }
  }
});

// Upload payment receipt
router.post('/upload', auth, upload.single('receipt'), async (req, res) => {
  try {
    const { amount, payment_type, description } = req.body;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'Receipt file is required' });
    }

    if (!amount || !payment_type) {
      return res.status(400).json({ message: 'Amount and payment type are required' });
    }

    // Insert payment record into MySQL
    const [result] = await db.mysql.execute(
      `INSERT INTO payments (user_id, amount, payment_type, description, receipt_path, status, created_at) 
       VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
      [userId, amount, payment_type, description || '', req.file.filename]
    );

    res.status(201).json({
      message: 'Payment uploaded successfully',
      payment_id: result.insertId,
      status: 'pending'
    });

  } catch (error) {
    console.error('Upload payment error:', error);
    res.status(500).json({
      message: 'Failed to upload payment',
      error: error.message
    });
  }
});

// Get payment history for user
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, type, page = 1, limit = 10 } = req.query;

    let query = `
      SELECT p.*, u.name as user_name 
      FROM payments p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
    `;
    const params = [userId];

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    if (type) {
      query += ' AND p.payment_type = ?';
      params.push(type);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const [payments] = await db.mysql.execute(query, params);

    res.json({
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: payments.length
      }
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      message: 'Failed to get payment history',
      error: error.message
    });
  }
});

// Approve payment (Admin only)
router.put('/:id/approve', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const paymentId = req.params.id;
    const { notes } = req.body;

    const [result] = await db.mysql.execute(
      'UPDATE payments SET status = ?, approved_by = ?, approved_at = NOW(), notes = ? WHERE id = ?',
      ['approved', req.user.id, notes || '', paymentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({ message: 'Payment approved successfully' });

  } catch (error) {
    console.error('Approve payment error:', error);
    res.status(500).json({
      message: 'Failed to approve payment',
      error: error.message
    });
  }
});

// Reject payment (Admin only)
router.put('/:id/reject', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const paymentId = req.params.id;
    const { reason } = req.body;

    const [result] = await db.mysql.execute(
      'UPDATE payments SET status = ?, rejected_by = ?, rejected_at = NOW(), rejection_reason = ? WHERE id = ?',
      ['rejected', req.user.id, reason || '', paymentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({ message: 'Payment rejected successfully' });

  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({
      message: 'Failed to reject payment',
      error: error.message
    });
  }
});

module.exports = router;