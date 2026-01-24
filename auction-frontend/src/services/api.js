import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Auctions API
export const auctionsAPI = {
  getAll: () => api.get('/auctions'),
  getById: (id) => api.get(`/auctions/${id}`),
  create: (data) => api.post('/auctions', data),
};

// Bids API
export const bidsAPI = {
  placeBid: (auctionId, amount) => 
    api.post(`/bids/auction/${auctionId}`, { amount }),
  getBidHistory: (auctionId) => api.get(`/bids/auction/${auctionId}`),
};

export default api;