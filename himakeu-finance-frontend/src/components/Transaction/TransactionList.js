import React, { useEffect, useState } from 'react';
import { getAllTransactions } from '../../api'; // Assuming this function is defined in src/api/index.js

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await getAllTransactions(); // Fetch transactions from the API
        setTransactions(response.data); // Assuming the response has a data property
      } catch (err) {
        setError(err.message); // Set error message if the fetch fails
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchTransactions(); // Call the fetch function
  }, []);

  if (loading) {
    return <div>Loading transactions...</div>; // Loading state
  }

  if (error) {
    return <div>Error: {error}</div>; // Error state
  }

  return (
    <div>
      <h2>Transaction List</h2>
      <table>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Member ID</th>
            <th>Amount</th>
            <th>Description</th>
            <th>Status</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => (
            <tr key={transaction.transaction_id}>
              <td>{transaction.transaction_id}</td>
              <td>{transaction.member_id}</td>
              <td>{transaction.amount}</td>
              <td>{transaction.description}</td>
              <td>{transaction.status}</td>
              <td>{new Date(transaction.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;