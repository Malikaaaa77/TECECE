// frontend/src/components/Auth/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    nim: '',
    faculty: '',
    batch: '',
    phoneNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('📝 Input change:', name, value);
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear general error too
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const validateForm = () => {
    console.log('🔍 Validating form data:', formData);
    const newErrors = {};

    // Required fields validation
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Full Name is required';
    }

    if (!formData.email || !formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.nim || !formData.nim.trim()) {
      newErrors.nim = 'NIM is required';
    }

    if (!formData.faculty || !formData.faculty.trim()) {
      newErrors.faculty = 'Faculty is required';
    }

    if (!formData.batch || !formData.batch.trim()) {
      newErrors.batch = 'Batch/Year is required';
    }

    if (!formData.password || formData.password.length === 0) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword || formData.confirmPassword.length === 0) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    console.log('❌ Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📤 Form submitted with data:', formData);
    
    // Clear any existing general error
    setErrors(prev => ({ ...prev, general: '' }));
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare data for API - match backend expectations
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        nim: formData.nim.trim(),
        faculty: formData.faculty.trim(),
        batch: formData.batch.trim(),
        phoneNumber: formData.phoneNumber.trim() || undefined
      };

      console.log('🚀 Sending registration data:', registrationData);
      
      const response = await register(registrationData);
      console.log('✅ Registration response:', response);

      if (response.success) {
        alert('🎉 Registration successful! You can now login with your credentials.');
        navigate('/login');
      } else {
        setErrors({ general: response.message || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      // Handle different types of errors
      if (error.response && error.response.data) {
        setErrors({ general: error.response.data.message || 'Registration failed. Please try again.' });
      } else if (error.message) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: 'Network error. Please check your connection and try again.' });
      }
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
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '500px'
      }}>
        <h1 style={{ textAlign: 'center', color: '#007bff', marginBottom: '30px' }}>
          Join HIMAKEU Finance
        </h1>

        {errors.general && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${errors.name ? '#dc3545' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              required
            />
            {errors.name && (
              <span style={{ color: '#dc3545', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                {errors.name}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${errors.email ? '#dc3545' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              required
            />
            {errors.email && (
              <span style={{ color: '#dc3545', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                {errors.email}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              NIM *
            </label>
            <input
              type="text"
              name="nim"
              value={formData.nim}
              onChange={handleChange}
              placeholder="Your student ID number"
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${errors.nim ? '#dc3545' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              required
            />
            {errors.nim && (
              <span style={{ color: '#dc3545', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                {errors.nim}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Faculty/Department *
            </label>
            <select
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${errors.faculty ? '#dc3545' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              required
            >
              <option value="">Select Faculty/Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Data Science">Data Science</option>
              <option value="Other">Other</option>
            </select>
            {errors.faculty && (
              <span style={{ color: '#dc3545', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                {errors.faculty}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Batch/Year *
            </label>
            <select
              name="batch"
              value={formData.batch}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${errors.batch ? '#dc3545' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              required
            >
              <option value="">Select Batch/Year</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
              <option value="2019">2019</option>
              <option value="Other">Other</option>
            </select>
            {errors.batch && (
              <span style={{ color: '#dc3545', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                {errors.batch}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Your phone number"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${errors.password ? '#dc3545' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              required
            />
            {errors.password && (
              <span style={{ color: '#dc3545', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                {errors.password}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${errors.confirmPassword ? '#dc3545' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              required
            />
            {errors.confirmPassword && (
              <span style={{ color: '#dc3545', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              backgroundColor: isLoading ? '#6c757d' : '#28a745',
              color: 'white',
              padding: '12px',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '15px'
            }}
          >
            {isLoading ? 'Creating Account...' : '📝 Create Account'}
          </button>
        </form>

        {/* Back to Login */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#666', marginBottom: '10px' }}>
            Already have an account?
          </p>
          <button 
            onClick={() => navigate('/login')}
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
            🔙 Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;