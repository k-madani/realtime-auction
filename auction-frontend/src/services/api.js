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
  getAllActive: () => api.get('/auctions/active'),
  getById: (id) => api.get(`/auctions/${id}`),
  getMyAuctions: () => api.get('/auctions/my-auctions'),
  create: (data) => api.post('/auctions', data),
  start: (id) => api.put(`/auctions/${id}/start`),
  end: (id) => api.put(`/auctions/${id}/end`),
  cancel: (id) => api.put(`/auctions/${id}/cancel`),
};

// Bids API
export const bidsAPI = {
  placeBid: (auctionId, amount) => 
    api.post(`/bids/auction/${auctionId}`, { amount }),
  getAuctionBids: (auctionId) => api.get(`/bids/auction/${auctionId}`),
  getHighestBid: (auctionId) => api.get(`/bids/auction/${auctionId}/highest`),
  getMyBids: () => api.get('/bids/my-bids'),
};

export default api;