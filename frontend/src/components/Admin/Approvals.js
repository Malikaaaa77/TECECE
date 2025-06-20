import React, { useState, useEffect, useCallback } from 'react';
import { getPendingApprovals, approvePayment, rejectPayment } from '../../api';
import LoadingSpinner from '../Common/LoadingSpinner';
import Modal from '../Common/Modal';
import './Approvals.css';

const Approvals = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending');

  const fetchPendingPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPendingApprovals();
      setPendingPayments(response.payments || []);
      setError('');
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      setError('Failed to fetch pending payments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingPayments();
  }, [fetchPendingPayments]); // ✅ Fixed dependency

  const handleApproval = async (transactionId, action, notes = '') => {
    try {
      setProcessing(transactionId);
      if (action === 'approve') {
        await approvePayment(transactionId, action, notes);
      } else {
        await rejectPayment(transactionId, notes);
      }
      fetchPendingPayments(); // Refresh list
    } catch (error) {
      console.error('Error processing approval:', error);
      setError('Failed to process approval');
    } finally {
      setProcessing(null);
    }
  };

  const openPaymentDetail = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    };
    
    return (
      <span className={`status-badge ${statusClasses[status.toLowerCase()]}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="payment-approvals">
      <div className="page-header">
        <h2>Payment Approvals</h2>
        <p>Review and approve member payment submissions</p>
      </div>

      <div className="approvals-controls">
        <div className="filter-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="status-filter"
          >
            <option value="pending">Pending Only</option>
            <option value="all">All Payments</option>
            <option value="approved">Approved Only</option>
            <option value="rejected">Rejected Only</option>
          </select>
          
          <button className="refresh-btn" onClick={fetchPendingPayments}>
            🔄 Refresh
          </button>
        </div>

        <div className="summary-stats">
          <div className="stat">
            <span className="label">Total Pending:</span>
            <span className="value">{pendingPayments.filter(p => p.status === 'pending').length}</span>
          </div>
          <div className="stat">
            <span className="label">Total Amount:</span>
            <span className="value">
              Rp {pendingPayments
                .filter(p => p.status === 'pending')
                .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
                .toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="approvals-list">
        {pendingPayments.length > 0 ? (
          <div className="payments-grid">
            {pendingPayments.map((payment) => (
              <div key={payment.id} className="payment-card">
                <div className="card-header">
                  <div className="member-info">
                    <h4>{payment.memberName || 'Unknown Member'}</h4>
                    <p className="member-id">NIM: {payment.member_nim || 'N/A'}</p>
                  </div>
                  {getStatusBadge(payment.status)}
                </div>

                <div className="card-content">
                  <div className="payment-details">
                    <div className="detail-item">
                      <span className="label">Period:</span>
                      <span className="value">{payment.month}/{payment.year}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Amount:</span>
                      <span className="value amount">Rp {parseFloat(payment.amount || 0).toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Submitted:</span>
                      <span className="value">{formatDate(payment.created_at)}</span>
                    </div>
                    {payment.description && (
                      <div className="detail-item">
                        <span className="label">Description:</span>
                        <span className="value">{payment.description}</span>
                      </div>
                    )}
                  </div>

                  {payment.receipt_url && (
                    <div className="receipt-preview">
                      <img 
                        src={payment.receipt_url} 
                        alt="Payment Receipt"
                        className="receipt-thumbnail"
                        onClick={() => window.open(payment.receipt_url, '_blank')}
                      />
                      <button 
                        className="view-receipt-btn"
                        onClick={() => window.open(payment.receipt_url, '_blank')}
                      >
                        View Full Receipt
                      </button>
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  <button 
                    className="details-btn"
                    onClick={() => openPaymentDetail(payment)}
                  >
                    View Details
                  </button>

                  {payment.status === 'pending' && (
                    <div className="approval-actions">
                      <button 
                        className="approve-btn"
                        onClick={() => handleApproval(payment.id, 'approve')}
                        disabled={processing === payment.id}
                      >
                        {processing === payment.id ? 'Processing...' : '✓ Approve'}
                      </button>
                      
                      <button 
                        className="reject-btn"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowModal(true);
                        }}
                        disabled={processing === payment.id}
                      >
                        ✗ Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <p>No payments found for the selected filter.</p>
          </div>
        )}
      </div>

      {/* Payment Detail Modal */}
      {showModal && selectedPayment && (
        <Modal 
          title="Payment Details" 
          onClose={() => {
            setShowModal(false);
            setSelectedPayment(null);
          }}
        >
          <div className="payment-detail-modal">
            <div className="detail-section">
              <h4>Member Information</h4>
              <p><strong>Name:</strong> {selectedPayment.member_name}</p>
              <p><strong>NIM:</strong> {selectedPayment.member_nim}</p>
              <p><strong>Email:</strong> {selectedPayment.member_email}</p>
            </div>

            <div className="detail-section">
              <h4>Payment Information</h4>
              <p><strong>Period:</strong> {selectedPayment.month}/{selectedPayment.year}</p>
              <p><strong>Amount:</strong> Rp {parseFloat(selectedPayment.amount || 0).toLocaleString()}</p>
              <p><strong>Status:</strong> {getStatusBadge(selectedPayment.status)}</p>
              <p><strong>Submitted:</strong> {formatDate(selectedPayment.created_at)}</p>
              {selectedPayment.description && (
                <p><strong>Description:</strong> {selectedPayment.description}</p>
              )}
            </div>

            {selectedPayment.receipt_url && (
              <div className="detail-section">
                <h4>Receipt</h4>
                <img 
                  src={selectedPayment.receipt_url} 
                  alt="Payment Receipt"
                  className="modal-receipt"
                />
              </div>
            )}

            {selectedPayment.status === 'pending' && (
              <div className="modal-actions">
                <button 
                  className="modal-approve-btn"
                  onClick={() => {
                    handleApproval(selectedPayment.id, 'approve');
                    setShowModal(false);
                  }}
                  disabled={processing === selectedPayment.id}
                >
                  ✓ Approve Payment
                </button>
                
                <button 
                  className="modal-reject-btn"
                  onClick={() => {
                    const reason = prompt('Please provide a reason for rejection:');
                    if (reason) {
                      handleApproval(selectedPayment.id, 'reject', reason);
                    }
                  }}
                  disabled={processing === selectedPayment.id}
                >
                  ✗ Reject Payment
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Approvals;