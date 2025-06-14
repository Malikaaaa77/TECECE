import React, { useEffect, useState } from 'react';
import { getPendingApprovals } from '../../api'; // Adjust the import based on your API structure

const PendingApprovals = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPendingApprovals = async () => {
      try {
        const response = await getPendingApprovals();
        setPendingPayments(response.data);
      } catch (err) {
        setError('Failed to fetch pending approvals');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingApprovals();
  }, []);

  const handleApprove = async (transactionId) => {
    // Implement the approve functionality here
  };

  const handleReject = async (transactionId) => {
    // Implement the reject functionality here
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Pending Payment Approvals</h2>
      {pendingPayments.length === 0 ? (
        <p>No pending approvals</p>
      ) : (
        <ul>
          {pendingPayments.map((payment) => (
            <li key={payment.transaction_id}>
              <div>
                <strong>Transaction ID:</strong> {payment.transaction_id}
                <br />
                <strong>Amount:</strong> {payment.amount}
                <br />
                <strong>Description:</strong> {payment.description}
                <br />
                <button onClick={() => handleApprove(payment.transaction_id)}>Approve</button>
                <button onClick={() => handleReject(payment.transaction_id)}>Reject</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PendingApprovals;