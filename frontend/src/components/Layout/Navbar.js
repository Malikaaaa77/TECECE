import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../api';
import './Navbar.css';

const Navbar = () => {
  const { user, setUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h3>HIMAKEU Finance</h3>
      </div>
      
      <div className="navbar-menu">
        <div className="navbar-user">
          <span className="user-name">Welcome, {user?.name}</span>
          <span className="user-role">{user?.role}</span>
        </div>
        
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;