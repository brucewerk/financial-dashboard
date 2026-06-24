// frontend/src/services/api.js
import axios from 'axios';

// Usar variável de ambiente ou fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('🔗 API URL configurada:', API_URL); // Debug

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`); // Debug
    return config;
  },
  (error) => {
    console.error('❌ Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`); // Debug
    return response;
  },
  (error) => {
    console.error('❌ Erro na resposta:', error.response?.status, error.message);
    
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