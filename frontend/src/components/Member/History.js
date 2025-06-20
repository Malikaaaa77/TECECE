// frontend/src/components/Member/History.js
import React, { useState, useEffect, useCallback } from 'react';
import { getPaymentHistory } from '../../api';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPaymentHistory();
      setHistory(response.history || []);
      setError('');
    } catch (error) {
      console.error('Error fetching history:', error);
      setError('Failed to fetch payment history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]); // ✅ Fixed dependency

  if (loading) return <div>Loading payment history...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Payment History</h2>
      {history.length === 0 ? (
        <p>No payment history found</p>
      ) : (
        <div>
          {history.map(payment => (
            <div key={payment.id} style={{ 
              border: '1px solid #ddd', 
              padding: '15px', 
              margin: '10px 0',
              borderRadius: '4px'
            }}>
              <h4>Payment #{payment.id}</h4>
              <p>Amount: Rp {payment.amount?.toLocaleString()}</p>
              <p>Status: <span style={{ 
                color: payment.status === 'approved' ? 'green' : 
                       payment.status === 'rejected' ? 'red' : 'orange'
              }}>{payment.status}</span></p>
              <p>Date: {new Date(payment.createdAt).toLocaleDateString()}</p>
              {payment.notes && <p>Notes: {payment.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;