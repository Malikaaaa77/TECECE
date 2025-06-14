import React, { useEffect, useState } from 'react';
import { getTransactions } from '../api';
import TransactionList from '../components/Transaction/TransactionList';

const TransactionPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return <div>Loading transactions...</div>;
  }

  if (error) {
    return <div>Error fetching transactions: {error}</div>;
  }

  return (
    <div>
      <h1>Transaction History</h1>
      <TransactionList transactions={transactions} />
    </div>
  );
};

export default TransactionPage;