import React, { useState } from 'react';
import { uploadPayment } from '../../api';
import './PayDues.css';

const PayDues = () => {
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: '',
    description: '',
    receipt: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      receipt: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      await uploadPayment(formDataToSend);
      setMessage('Payment submitted successfully! Waiting for admin approval.');
      
      // Reset form
      setFormData({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        amount: '',
        description: '',
        receipt: null
      });
    } catch (error) {
      setMessage('Failed to submit payment. Please try again.');
      console.error('Payment submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pay-dues">
      <div className="page-header">
        <h2>Pay Monthly Dues</h2>
        <p>Submit your monthly payment with receipt for verification</p>
      </div>

      <div className="payment-form-container">
        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-section">
            <h3>Payment Details</h3>
            
            <div className="form-group">
              <label htmlFor="month">Month</label>
              <select
                id="month"
                name="month"
                value={formData.month}
                onChange={handleInputChange}
                required
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="year">Year</label>
              <select
                id="year"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                required
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return (
                    <option key={year} value={year}>{year}</option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount (Rp)</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Enter payment amount"
                required
                min="1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Payment description (optional)"
                rows="3"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Receipt Upload</h3>
            
            <div className="form-group">
              <label htmlFor="receipt">Payment Receipt</label>
              <input
                type="file"
                id="receipt"
                name="receipt"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                required
              />
              <small className="help-text">
                Upload receipt image or PDF (Max 5MB)
              </small>
            </div>
          </div>

          {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Payment'}
            </button>
          </div>
        </form>

        <div className="payment-info">
          <h3>Payment Information</h3>
          <div className="info-card">
            <h4>Bank Transfer Details</h4>
            <p><strong>Bank:</strong> BCA</p>
            <p><strong>Account Number:</strong> 1234567890</p>
            <p><strong>Account Name:</strong> HIMAKEU Finance</p>
            <p><strong>Amount:</strong> Rp 50,000 (Monthly Dues)</p>
          </div>
          
          <div className="info-card">
            <h4>Payment Instructions</h4>
            <ol>
              <li>Transfer the monthly dues to the account above</li>
              <li>Take a screenshot or photo of the transfer receipt</li>
              <li>Fill out the form and upload the receipt</li>
              <li>Wait for admin approval (usually within 24 hours)</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayDues;