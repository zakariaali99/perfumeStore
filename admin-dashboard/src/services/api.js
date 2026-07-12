import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

// Add auth interceptor if we had login
/*
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
*/

export const adminApi = {
    getStats: () => api.get('/analytics/stats/'),
    getProducts: (params) => api.get('/products/admin/products/', { params }),
    getOrders: (params) => api.get('/orders/', { params }),
    updateOrderStatus: (id, status) => api.patch(`/orders/${id}/`, { status }),
};

export default api;
