import React, { useEffect, useState } from 'react';
import { getAdminDashboardData } from '../../api';
import './Dashboard.css';

const Dashboard = () => {
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getAdminDashboardData();
        setFinancialData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      <div className="financial-summary">
        <h2>Financial Summary</h2>
        <p>Total Income: {financialData.financial.totalIncome}</p>
        <p>Total Expense: {financialData.financial.totalExpense}</p>
        <p>Current Balance: {financialData.financial.currentBalance}</p>
        <p>Monthly Income: {financialData.financial.monthlyIncome}</p>
        <p>Monthly Expense: {financialData.financial.monthlyExpense}</p>
      </div>
      <div className="pending-approvals">
        <h2>Pending Approvals</h2>
        <p>Pending Payments: {financialData.pendingApprovals}</p>
      </div>
      <div className="member-stats">
        <h2>Member Statistics</h2>
        <p>Total Members: {financialData.memberStats.total_members}</p>
        <p>Active Members: {financialData.memberStats.active_members}</p>
      </div>
    </div>
  );
};

export default Dashboard;