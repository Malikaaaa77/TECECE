// frontend/src/api/index.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🔗 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('📨 API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Auth API functions
export const authLogin = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const authLogout = async () => {
  try {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return response.data;
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw error.response?.data || error;
  }
};

export const logout = authLogout; // Alias untuk compatibility

// Admin API functions
export const getAdminDashboard = async () => {
  try {
    const response = await api.get('/admin/dashboard');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getPendingApprovals = async () => {
  try {
    const response = await api.get('/admin/pending-approvals');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const approvePayment = async (transactionId, action, notes = '') => {
  try {
    const response = await api.post('/admin/approve-payment', {
      transactionId,
      action,
      notes
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const rejectPayment = async (transactionId, notes = '') => {
  try {
    const response = await api.post('/admin/reject-payment', {
      transactionId,
      notes
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addExpense = async (expenseData) => {
  try {
    const response = await api.post('/admin/add-expense', expenseData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getTransactions = async (params = {}) => {
  try {
    const response = await api.get('/admin/transactions', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateTransaction = async (id, data) => {
  try {
    const response = await api.put(`/admin/transactions/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteTransaction = async (id) => {
  try {
    const response = await api.delete(`/admin/transactions/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getMembers = async () => {
  try {
    const response = await api.get('/admin/members');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllMembers = getMembers; // Alias untuk compatibility

export const updateMemberStatus = async (id, status) => {
  try {
    const response = await api.put(`/admin/members/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/admin/members/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Member API functions
export const getMemberDashboard = async () => {
  try {
    const response = await api.get('/member/dashboard');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get('/member/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/member/profile', profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const uploadPaymentProof = async (formData) => {
  try {
    const response = await api.post('/member/upload-payment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const uploadPayment = uploadPaymentProof; // Alias untuk compatibility

export const getPaymentHistory = async () => {
  try {
    const response = await api.get('/member/payment-history');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Payment functions
export const payDues = async (paymentData) => {
  try {
    const response = await api.post('/member/pay-dues', paymentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getDuesInfo = async () => {
  try {
    const response = await api.get('/member/dues-info');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Settings
export const getSettings = async () => {
  try {
    const response = await api.get('/admin/settings');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateSettings = async (settings) => {
  try {
    const response = await api.put('/admin/settings', settings);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Reports
export const getReports = async (params = {}) => {
  try {
    const response = await api.get('/admin/reports', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const generateReport = async (reportType, params = {}) => {
  try {
    const response = await api.post('/admin/generate-report', {
      type: reportType,
      ...params
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default api;