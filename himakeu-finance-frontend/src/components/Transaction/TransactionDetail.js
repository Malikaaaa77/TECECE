import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTransactionById } from '../../api';

const TransactionDetail = () => {
  const { transactionId } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const data = await getTransactionById(transactionId);
        setTransaction(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Transaction Detail</h2>
      {transaction ? (
        <div>
          <p><strong>Transaction ID:</strong> {transaction.transaction_id}</p>
          <p><strong>Member Name:</strong> {transaction.full_name}</p>
          <p><strong>Amount:</strong> {transaction.amount}</p>
          <p><strong>Description:</strong> {transaction.description}</p>
          <p><strong>Status:</strong> {transaction.status}</p>
          <p><strong>Created At:</strong> {new Date(transaction.created_at).toLocaleString()}</p>
        </div>
      ) : (
        <p>No transaction found.</p>
      )}
    </div>
  );
};

export default TransactionDetail;