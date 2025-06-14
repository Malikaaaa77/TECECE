import React from 'react';
import Dashboard from '../components/Admin/Dashboard';
import PendingApprovals from '../components/Admin/PendingApprovals';
import AddExpense from '../components/Admin/AddExpense';

const AdminPage = () => {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <Dashboard />
      <PendingApprovals />
      <AddExpense />
    </div>
  );
};

export default AdminPage;