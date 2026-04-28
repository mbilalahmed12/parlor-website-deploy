import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://parlor-backend.onrender.com/api' : 'http://localhost:5000/api');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Services endpoints
export const servicesAPI = {
  getAll: (params) => api.get('/services', { params }),
  getAllAdmin: () => api.get('/services/admin/all'),
  getCategories: (params) => api.get('/services/categories/list', { params }),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

// Bookings endpoints
export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getAll: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, status) => api.put(`/bookings/${id}`, { status }),
  delete: (id) => api.delete(`/bookings/${id}`),
};

// Reviews endpoints
export const reviewsAPI = {
  submit: (data) => api.post('/reviews', data),
  getApproved: () => api.get('/reviews'),
  getAll: () => api.get('/reviews/admin/all'),
  approve: (id) => api.put(`/reviews/${id}/approve`),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// Settings endpoints
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export default api;
