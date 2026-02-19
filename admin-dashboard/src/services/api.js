import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

// Auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminApi = {
  getStats: () => api.get('/analytics/stats/'),
  getProducts: (params) => api.get('/products/admin/products/', { params }),
  getOrders: (params) => api.get('/orders/', { params }),
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/`, { status }),

  // Categories
  getCategories: () => api.get('/products/admin/categories/'),
  createCategory: (data) => api.post('/products/admin/categories/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateCategory: (id, data) => api.patch(`/products/admin/categories/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteCategory: (id) => api.delete(`/products/admin/categories/${id}/`),
};

export default api;
