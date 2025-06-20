// frontend/src/pages/MemberDashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MemberDashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage or context
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // Redirect to login if no user data
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ 
        backgroundColor: '#007bff', 
        color: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h1>🎉 Welcome to Member Dashboard</h1>
        <p>Hello, {user.name}!</p>
      </header>

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>User Information</h2>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>NIM:</strong> {user.nim}</p>
        <p><strong>Faculty:</strong> {user.faculty}</p>
        <p><strong>Batch:</strong> {user.batch}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Quick Actions</h2>
        <button style={{
          backgroundColor: '#28a745',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          marginRight: '10px',
          cursor: 'pointer'
        }}>
          View Payment History
        </button>
        <button style={{
          backgroundColor: '#17a2b8',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          marginRight: '10px',
          cursor: 'pointer'
        }}>
          Upload Payment Proof
        </button>
      </div>

      <div>
        <button 
          onClick={handleLogout}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default MemberDashboard;