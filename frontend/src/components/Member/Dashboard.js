import React, { useState, useEffect } from 'react';
import { getMemberDashboard } from '../../api';
import LoadingSpinner from '../Common/LoadingSpinner';
import './Dashboard.css';

const MemberDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await getMemberDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="member-dashboard">
      <div className="dashboard-header">
        <h2>Member Dashboard</h2>
        <p>Welcome back! Here's your payment overview.</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon payment-status">💳</div>
          <div className="stat-content">
            <h3>Payment Status</h3>
            <p className={`status ${dashboardData?.paymentStatus?.toLowerCase()}`}>
              {dashboardData?.paymentStatus || 'Pending'}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon dues">📅</div>
          <div className="stat-content">
            <h3>Current Month Dues</h3>
            <p className="amount">Rp {dashboardData?.currentDues?.toLocaleString() || '0'}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon total">💰</div>
          <div className="stat-content">
            <h3>Total Paid This Year</h3>
            <p className="amount">Rp {dashboardData?.totalPaid?.toLocaleString() || '0'}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">⏳</div>
          <div className="stat-content">
            <h3>Pending Payments</h3>
            <p className="count">{dashboardData?.pendingCount || 0}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-payments">
          <h3>Recent Payments</h3>
          <div className="payments-list">
            {dashboardData?.recentPayments?.map((payment) => (
              <div key={payment.id} className="payment-item">
                <div className="payment-info">
                  <h4>{payment.month} {payment.year}</h4>
                  <p>Rp {payment.amount.toLocaleString()}</p>
                </div>
                <div className={`payment-status ${payment.status.toLowerCase()}`}>
                  {payment.status}
                </div>
              </div>
            )) || (
              <p className="no-data">No recent payments found.</p>
            )}
          </div>
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <button 
              className="action-btn pay-dues"
              onClick={() => window.location.href = '/member/pay-dues'}
            >
              <span className="btn-icon">💳</span>
              <span>Pay Monthly Dues</span>
            </button>
            
            <button 
              className="action-btn view-history"
              onClick={() => window.location.href = '/member/history'}
            >
              <span className="btn-icon">📋</span>
              <span>View History</span>
            </button>
            
            <button 
              className="action-btn update-profile"
              onClick={() => window.location.href = '/member/profile'}
            >
              <span className="btn-icon">👤</span>
              <span>Update Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;