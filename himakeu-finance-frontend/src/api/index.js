import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Penting untuk session/cookie
});

// AUTH
export const login = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data; // { success, data, message }
};

export const register = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
};

export const getProfile = async () => {
  const response = await axiosInstance.get('/auth/profile');
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post('/auth/logout');
  return response.data;
};

// MEMBER
export const getMemberDashboard = async () => {
  const response = await axiosInstance.get('/member/dashboard');
  return response.data.data; // Ambil data dari { success, data }
};

export const uploadPayment = async (formData) => {
  const response = await axiosInstance.post('/member/upload-payment', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getPaymentHistory = async () => {
  const response = await axiosInstance.get('/member/payment-history');
  return response.data.data;
};

// ADMIN
export const getAdminDashboard = async () => {
  const response = await axiosInstance.get('/admin/dashboard');
  return response.data.data;
};

export const approvePayment = async (paymentId) => {
  const response = await axiosInstance.post(`/admin/approve-payment/${paymentId}`);
  return response.data;
};

export const rejectPayment = async (paymentId) => {
  const response = await axiosInstance.post(`/admin/reject-payment/${paymentId}`);
  return response.data;
};

export const addExpense = async (expenseData) => {
  const response = await axiosInstance.post('/admin/add-expense', expenseData);
  return response.data;
};