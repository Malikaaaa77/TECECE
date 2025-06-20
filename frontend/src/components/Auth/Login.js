// frontend/src/components/Auth/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authLogin } from '../../api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Debug current location
  useEffect(() => {
    console.log('🌐 Current location:', location.pathname);
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authLogin(formData);
      console.log('✅ Login response received:', response);

      if (response.success) {
        // Store user data with token if available
        localStorage.setItem('user', JSON.stringify(response.user));
        if (response.token) {
          localStorage.setItem('token', response.token);
          console.log('🔑 Token saved:', response.token.substring(0, 20) + '...');
        }
        
        const targetPath = response.user.role === 'admin' 
          ? '/admin/dashboard' 
          : '/member/dashboard';
        
        console.log('🎯 Attempting to navigate to:', targetPath);
        console.log('🎯 User role:', response.user.role);
        
        // Force navigation with window.location as fallback
        try {
          navigate(targetPath, { replace: true });
          console.log('✅ Navigate called successfully');
          
          // Fallback: if navigation doesn't work after 1 second
          setTimeout(() => {
            if (window.location.pathname === '/login') {
              console.log('⚠️ Navigation failed, using window.location fallback');
              window.location.href = targetPath;
            }
          }, 1000);
          
        } catch (navError) {
          console.error('❌ Navigation error:', navError);
          window.location.href = targetPath;
        }
        
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (role) => {
    const credentials = {
      admin: { email: 'admin@himakeu.com', password: 'admin123' },
      member: { email: 'member@himakeu.com', password: 'member123' }
    };

    setIsLoading(true);
    setError('');

    try {
      const response = await authLogin(credentials[role]);
      console.log('✅ Quick login response:', response);

      if (response.success) {
        localStorage.setItem('user', JSON.stringify(response.user));
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        
        const targetPath = role === 'admin' ? '/admin/dashboard' : '/member/dashboard';
        console.log('🎯 Quick login navigating to:', targetPath);
        
        try {
          navigate(targetPath, { replace: true });
          
          // Fallback
          setTimeout(() => {
            if (window.location.pathname === '/login') {
              console.log('⚠️ Quick login navigation failed, using fallback');
              window.location.href = targetPath;
            }
          }, 1000);
          
        } catch (navError) {
          console.error('❌ Quick login navigation error:', navError);
          window.location.href = targetPath;
        }
        
      } else {
        setError(response.message || 'Quick login failed');
      }
    } catch (error) {
      console.error('❌ Quick login error:', error);
      setError('Quick login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '400px'
      }}>
        <h1 style={{ textAlign: 'center', color: '#007bff', marginBottom: '30px' }}>
          HIMAKEU Finance
        </h1>

        {/* Debug Info */}
        <div style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '15px',
          fontSize: '12px'
        }}>
          <strong>Debug Info:</strong>
          <br />Current Path: {location.pathname}
          <br />User in Storage: {localStorage.getItem('user') ? 'Yes' : 'No'}
          <br />Token in Storage: {localStorage.getItem('token') ? 'Yes' : 'No'}
        </div>

        {/* Quick Login Buttons */}
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <p style={{ marginBottom: '15px', color: '#666' }}>Quick Login for Testing:</p>
          
          <button 
            onClick={() => handleQuickLogin('admin')}
            disabled={isLoading}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              margin: '5px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {isLoading ? 'Loading...' : '👑 Login as Admin'}
          </button>
          
          <br />
          
          <button 
            onClick={() => handleQuickLogin('member')}
            disabled={isLoading}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              margin: '5px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {isLoading ? 'Loading...' : '🎉 Login as Member'}
          </button>
        </div>

        <hr style={{ margin: '20px 0', border: '1px solid #eee' }} />

        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@himakeu.com"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="admin123"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              backgroundColor: '#007bff',
              color: 'white',
              padding: '12px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '15px'
            }}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Register Button */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#666', marginBottom: '10px' }}>
            Don't have an account?
          </p>
          <button 
            onClick={() => {
              console.log('🔗 Navigating to register');
              navigate('/register');
            }}
            style={{
              backgroundColor: 'transparent',
              color: '#007bff',
              border: '2px solid #007bff',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              width: '100%'
            }}
          >
            📝 Create New Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;