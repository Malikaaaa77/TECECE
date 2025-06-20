// frontend/src/components/Admin/Transactions.js
import React, { useState, useEffect, useCallback } from 'react';
import { getTransactions, addExpense, updateTransaction, deleteTransaction } from '../../api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'operational'
  });

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getTransactions();
      setTransactions(response.transactions || []);
      setError('');
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]); // ✅ Fixed dependency

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await addExpense({
        ...newExpense,
        amount: parseFloat(newExpense.amount)
      });
      setNewExpense({ description: '', amount: '', category: 'operational' });
      setShowAddForm(false);
      fetchTransactions(); // Refresh list
    } catch (error) {
      console.error('Error adding expense:', error);
      setError('Failed to add expense');
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(id);
        fetchTransactions(); // Refresh list
      } catch (error) {
        console.error('Error deleting transaction:', error);
        setError('Failed to delete transaction');
      }
    }
  };

  if (loading) return <div>Loading transactions...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Transactions</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px' }}
        >
          {showAddForm ? 'Cancel' : 'Add Expense'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddExpense} style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>Add New Expense</h3>
          <div style={{ marginBottom: '15px' }}>
            <label>Description:</label>
            <input
              type="text"
              value={newExpense.description}
              onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
              style={{ width: '100%', padding: '8px', margin: '5px 0' }}
              required
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Amount:</label>
            <input
              type="number"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
              style={{ width: '100%', padding: '8px', margin: '5px 0' }}
              required
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Category:</label>
            <select
              value={newExpense.category}
              onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
              style={{ width: '100%', padding: '8px', margin: '5px 0' }}
            >
              <option value="operational">Operational</option>
              <option value="event">Event</option>
              <option value="equipment">Equipment</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button type="submit" style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px' }}>
            Add Expense
          </button>
        </form>
      )}

      <div>
        {transactions.length === 0 ? (
          <p>No transactions found</p>
        ) : (
          transactions.map(transaction => (
            <div key={transaction.id} style={{ 
              border: '1px solid #ddd', 
              padding: '15px', 
              margin: '10px 0',
              borderRadius: '4px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4>{transaction.description}</h4>
                  <p>Amount: Rp {transaction.amount?.toLocaleString()}</p>
                  <p>Type: {transaction.type}</p>
                  <p>Date: {new Date(transaction.createdAt).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={() => handleDeleteTransaction(transaction.id)}
                  style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Transactions;