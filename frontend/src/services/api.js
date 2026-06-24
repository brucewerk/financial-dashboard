// frontend/src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const finance = {
  getInvestments: () => api.get('/finance/investments'),
  createInvestment: (data) => api.post('/finance/investments', data),
  updateInvestment: (id, data) => api.put(`/finance/investments/${id}`, data),
  deleteInvestment: (id) => api.delete(`/finance/investments/${id}`),
  
  getTransactions: (params) => api.get('/finance/transactions', { params }),
  createTransaction: (data) => api.post('/finance/transactions', data),
  updateTransaction: (id, data) => api.put(`/finance/transactions/${id}`, data),
  deleteTransaction: (id) => api.delete(`/finance/transactions/${id}`),
  
  getBalances: (params) => api.get('/finance/balances', { params }),
  createBalance: (data) => api.post('/finance/balances', data),
  updateBalance: (id, data) => api.put(`/finance/balances/${id}`, data),
  deleteBalance: (id) => api.delete(`/finance/balances/${id}`),
  
  getStats: () => api.get('/finance/stats'),
};

export default api;