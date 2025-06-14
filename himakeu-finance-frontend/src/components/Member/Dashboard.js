import React, { useEffect, useState } from 'react';
import { getDashboardData } from '../../api'; // Assuming you have an API function to fetch dashboard data

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getDashboardData(); // Fetching dashboard data from the API
        setDashboardData(data);
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
    <div>
      <h1>Member Dashboard</h1>
      <h2>Financial Transparency</h2>
      <p>Current Balance: {dashboardData.transparency.currentBalance}</p>
      <p>Total Income: {dashboardData.transparency.totalIncome}</p>
      <p>Total Expense: {dashboardData.transparency.totalExpense}</p>

      <h2>Dues Status</h2>
      <ul>
        {dashboardData.duesStatus.map((due) => (
          <li key={due.period}>
            Period: {due.period}, Amount: {due.amount}, Status: {due.status}
          </li>
        ))}
      </ul>

      <h2>Total Paid: {dashboardData.totalPaid}</h2>
    </div>
  );
};

export default Dashboard;