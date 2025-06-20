// frontend/src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/Admin/Dashboard';
import Members from '../components/Admin/Members';
import Approvals from '../components/Admin/Approvals';
import Transactions from '../components/Admin/Transactions';
import { logout } from '../api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in and is admin
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      alert('Access denied. Admin role required.');
      navigate('/login');
      return;
    }

    setUser(parsedUser);
    console.log('✅ Admin authenticated:', parsedUser);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      console.log('👋 Admin logged out');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API fails
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'members', label: '👥 Members', icon: '👥' },
    { id: 'approvals', label: '✅ Approvals', icon: '✅' },
    { id: 'transactions', label: '💰 Transactions', icon: '💰' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'members':
        return <Members />;
      case 'approvals':
        return <Approvals />;
      case 'transactions':
        return <Transactions />;
      default:
        return <Dashboard />;
    }
  };

  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      {/* Sidebar */}
      <div style={{
        width: '250px',
        backgroundColor: '#2c3e50',
        color: 'white',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #34495e',
          textAlign: 'center'
        }}>
          <h2 style={{ margin: 0, color: '#ecf0f1' }}>👑 Admin Panel</h2>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#bdc3c7' }}>
            Welcome, {user.name || user.username}
          </p>
        </div>

        {/* Menu Items */}
        <nav style={{ flex: 1, padding: '20px 0' }}>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                padding: '15px 20px',
                backgroundColor: activeTab === item.id ? '#3498db' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'background-color 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== item.id) {
                  e.target.style.backgroundColor = '#34495e';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== item.id) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div style={{ padding: '20px', borderTop: '1px solid #34495e' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ecf0f1'
      }}>
        {/* Top Header */}
        <header style={{
          backgroundColor: 'white',
          padding: '20px 30px',
          borderBottom: '1px solid #bdc3c7',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div>
            <h1 style={{ margin: 0, color: '#2c3e50' }}>
              {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p style={{ margin: '5px 0 0 0', color: '#7f8c8d' }}>
              HIMAKEU Finance Management System
            </p>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '15px',
            color: '#2c3e50'
          }}>
            <span style={{ fontSize: '14px' }}>
              📅 {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <div style={{
              width: '1px',
              height: '20px',
              backgroundColor: '#bdc3c7'
            }}></div>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
              👤 {user.name || user.username}
            </span>
          </div>
        </header>

        {/* Content Area */}
        <main style={{
          flex: 1,
          padding: '30px',
          overflow: 'auto'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            minHeight: 'calc(100vh - 200px)'
          }}>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;