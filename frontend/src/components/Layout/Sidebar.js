import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();

  const memberMenus = [
    { path: '/member/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/member/pay-dues', label: 'Pay Dues', icon: '💳' },
    { path: '/member/history', label: 'History', icon: '📋' },
    { path: '/member/profile', label: 'Profile', icon: '👤' }
  ];

  const adminMenus = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📈' },
    { path: '/admin/approvals', label: 'Approvals', icon: '✅' },
    { path: '/admin/members', label: 'Members', icon: '👥' },
    { path: '/admin/transactions', label: 'Transactions', icon: '💰' }
  ];

  const menus = user?.role === 'admin' ? adminMenus : memberMenus;

  return (
    <aside className="sidebar">
      <div className="sidebar-menu">
        {menus.map((menu) => (
          <NavLink
            key={menu.path}
            to={menu.path}
            className={({ isActive }) => 
              `menu-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="menu-icon">{menu.icon}</span>
            <span className="menu-label">{menu.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;