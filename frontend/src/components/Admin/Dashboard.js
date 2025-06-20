// frontend/src/components/Admin/Dashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { getAdminDashboard } from '../../api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalMembers: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    totalTransactions: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAdminDashboard();
      setDashboardData(response.data || {
        totalMembers: 0,
        totalRevenue: 0,
        pendingPayments: 0,
        totalTransactions: 0,
        recentActivities: []
      });
      setError('');
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      setError('Failed to fetch dashboard data');
      // Set dummy data for demo
      setDashboardData({
        totalMembers: 156,
        totalRevenue: 45000000,
        pendingPayments: 12,
        totalTransactions: 89,
        recentActivities: [
          { id: 1, type: 'payment', user: 'John Doe', amount: 50000, date: new Date() },
          { id: 2, type: 'expense', description: 'Office supplies', amount: 150000, date: new Date() }
        ]
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div style={{
      backgroundColor: 'white',
      padding: '25px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      border: `3px solid ${color}`,
      transition: 'transform 0.2s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ 
            margin: 0, 
            color: '#2c3e50', 
            fontSize: '16px',
            fontWeight: '600'
          }}>
            {title}
          </h3>
          <p style={{ 
            margin: '10px 0 5px 0', 
            fontSize: '32px', 
            fontWeight: 'bold',
            color: color
          }}>
            {value}
          </p>
          {subtitle && (
            <p style={{ 
              margin: 0, 
              fontSize: '14px', 
              color: '#7f8c8d'
            }}>
              {subtitle}
            </p>
          )}
        </div>
        <div style={{ 
          fontSize: '40px',
          opacity: 0.7
        }}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ 
          color: '#2c3e50', 
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          📊 Dashboard Overview
        </h2>
        <p style={{ color: '#7f8c8d', margin: 0 }}>
          Welcome to HIMAKEU Finance Management System
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#ffeaa7',
          color: '#2d3436',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #fdcb6e'
        }}>
          ⚠️ {error} (Showing demo data)
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginBottom: '40px'
      }}>
        <StatCard
          title="Total Members"
          value={dashboardData.totalMembers}
          icon="👥"
          color="#3498db"
          subtitle="Active members"
        />
        <StatCard
          title="Total Revenue"
          value={`Rp ${dashboardData.totalRevenue?.toLocaleString('id-ID') || '0'}`}
          icon="💰"
          color="#2ecc71"
          subtitle="This month"
        />
        <StatCard
          title="Pending Payments"
          value={dashboardData.pendingPayments}
          icon="⏳"
          color="#f39c12"
          subtitle="Awaiting approval"
        />
        <StatCard
          title="Total Transactions"
          value={dashboardData.totalTransactions}
          icon="📋"
          color="#9b59b6"
          subtitle="This month"
        />
      </div>

      {/* Recent Activities */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '25px',
        borderRadius: '12px',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ 
          color: '#2c3e50', 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          📈 Recent Activities
        </h3>
        
        {dashboardData.recentActivities && dashboardData.recentActivities.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {dashboardData.recentActivities.map(activity => (
              <div key={activity.id} style={{
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid #dee2e6'
              }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#2c3e50' }}>
                    {activity.type === 'payment' ? '💳' : '🛒'} {activity.user || activity.description}
                  </p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#7f8c8d' }}>
                    {activity.date ? new Date(activity.date).toLocaleDateString('id-ID') : 'Today'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ 
                    margin: 0, 
                    fontWeight: 'bold',
                    color: activity.type === 'payment' ? '#2ecc71' : '#e74c3c'
                  }}>
                    {activity.type === 'payment' ? '+' : '-'}Rp {activity.amount?.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: '#7f8c8d'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📭</div>
            <p>No recent activities</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ 
          color: '#2c3e50', 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          ⚡ Quick Actions
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px' 
        }}>
          <button style={{
            padding: '20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            👥 View All Members
          </button>
          
          <button style={{
            padding: '20px',
            backgroundColor: '#2ecc71',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            ✅ Process Approvals
          </button>
          
          <button style={{
            padding: '20px',
            backgroundColor: '#f39c12',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            💰 Add Transaction
          </button>
          
          <button style={{
            padding: '20px',
            backgroundColor: '#9b59b6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            📊 Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;