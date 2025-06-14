// filepath: /himakeu-finance-frontend/himakeu-finance-frontend/src/utils/helpers.js
// utils/helpers.js

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validateRequiredFields = (fields) => {
  return fields.every(field => field.trim() !== '');
};

export const handleApiResponse = (response) => {
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};