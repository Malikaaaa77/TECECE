import React, { useEffect, useState } from 'react';
import { getPaymentHistory } from '../../api';

const PaymentHistory = () => {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        const response = await getPaymentHistory();
        setPaymentHistory(response.data);
      } catch (err) {
        setError('Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Payment History</h2>
      <table>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Amount</th>
            <th>Description</th>
            <th>Status</th>
            <th>Receipt</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {paymentHistory.map((payment) => (
            <tr key={payment.transaction_id}>
              <td>{payment.transaction_id}</td>
              <td>{payment.amount}</td>
              <td>{payment.description}</td>
              <td>{payment.status}</td>
              <td>
                {payment.receipt_url ? (
                  <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer">View Receipt</a>
                ) : (
                  'No Receipt'
                )}
              </td>
              <td>{new Date(payment.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentHistory;