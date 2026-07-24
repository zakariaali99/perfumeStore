import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor to handle token refresh/expiration
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Determine if this request originated from the dashboard
        const requestUrl = originalRequest?.url || '';
        const isDashboardRequest = requestUrl.includes('accounts/') ||
            requestUrl.includes('analytics/') ||
            requestUrl.includes('cms/') ||
            requestUrl.includes('crm/') ||
            requestUrl.includes('admin/') ||
            requestUrl.includes('backups/');

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const res = await axios.post(`${api.defaults.baseURL}accounts/token/refresh/`, {
                        refresh: refreshToken,
                    });
                    localStorage.setItem('access_token', res.data.access);
                    api.defaults.headers.common.Authorization = `Bearer ${res.data.access}`;
                    return api(originalRequest);
                } catch {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    if (isDashboardRequest) {
                        window.location.href = '/dashboard/login';
                        return new Promise(() => {});
                    }
                }
            } else {
                if (isDashboardRequest) {
                    window.location.href = '/dashboard/login';
                    return new Promise(() => {});
                }
            }
        }
        return Promise.reject(error);
    }
);

export const accountsApi = {
    login: (data) => api.post('accounts/login/', data),
    getMe: () => api.get('accounts/me/'),
};

export const productsApi = {
    getAll: (params) => api.get('products/products/', { params }),
    getDetail: (id) => api.get(`products/products/${id}/`),
    getCategories: () => api.get('products/categories/'),
    getBrands: () => api.get('products/brands/'),
    getRelated: (id) => api.get(`products/products/${id}/related/`),
};

export const cartApi = {
    get: () => api.get('cart/'),
    addItem: (data) => api.post('cart/add_item/', data),
    updateItem: (data) => api.patch('cart/update_item/', data),
    removeItem: (itemId) => api.delete('cart/remove_item/', { data: { item_id: itemId } }),
    clear: () => api.delete('cart/clear/'),
};

export const ordersApi = {
    getAll: (params) => api.get('orders/', { params }),
    create: (data) => api.post('orders/', data),
    getDetail: (number) => api.get(`orders/${number}/`),
    track: (number, phone) => api.get('orders/track/', { params: { order_number: number, phone } }),
    updateStatus: (id, data) => api.patch(`orders/${id}/update_status/`, data),
};

export const cmsApi = {
    getSlides: () => api.get('cms/slides/'),
    createSlide: (data) => api.post('cms/slides/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    updateSlide: (id, data) => api.patch(`cms/slides/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    deleteSlide: (id) => api.delete(`cms/slides/${id}/`),
    getBanners: () => api.get('cms/banners/'),
    createBanner: (data) => api.post('cms/banners/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    updateBanner: (id, data) => api.patch(`cms/banners/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    deleteBanner: (id) => api.delete(`cms/banners/${id}/`),
    getSettings: () => api.get('cms/settings/'),
    updateSettings: (id, data) => api.patch(`cms/settings/${id}/`, data),
    getHPC: () => api.get('cms/sections/'),
    updateHPC: (id, data) => api.patch(`cms/sections/${id}/`, data),
};

export const marketingApi = {
    list: (params) => api.get('marketing/coupons/', { params }),
    create: (data) => api.post('marketing/coupons/', data),
    update: (code, data) => api.patch(`marketing/coupons/${code}/`, data),
    delete: (code) => api.delete(`marketing/coupons/${code}/`),
    validateCoupon: (code, cartTotal) => api.post('marketing/coupons/validate/', { code, cart_total: cartTotal }),
};

export const crmApi = {
    getProfiles: (params) => api.get('crm/customers/', { params }),
    getProfileDetail: (id) => api.get(`crm/customers/${id}/`),
    getInteractions: (params) => api.get('crm/interactions/', { params }),
    addInteraction: (customerId, data) => api.post(`crm/customers/${customerId}/add_interaction/`, data),
    getTags: () => api.get('crm/tags/'),
};

export const adminProductsApi = {
    getAll: (params) => api.get('products/admin/products/', { params }),
    getDetail: (id) => api.get(`products/admin/products/${id}/`),
    create: (data) => api.post('products/admin/products/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    update: (id, data) => api.patch(`products/admin/products/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    delete: (id) => api.delete(`products/admin/products/${id}/`),
};

export const adminVariantsApi = {
    create: (data) => api.post('products/admin/variants/', data),
    update: (id, data) => api.patch(`products/admin/variants/${id}/`, data),
    delete: (id) => api.delete(`products/admin/variants/${id}/`),
};

export const adminCategoriesApi = {
    getAll: (params) => api.get('products/admin/categories/', { params }),
    create: (data) => api.post('products/admin/categories/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    update: (id, data) => api.patch(`products/admin/categories/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    delete: (id) => api.delete(`products/admin/categories/${id}/`),
};

export const adminBrandsApi = {
    getAll: (params) => api.get('products/admin/brands/', { params }),
    create: (data) => api.post('products/admin/brands/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    update: (id, data) => api.patch(`products/admin/brands/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    delete: (id) => api.delete(`products/admin/brands/${id}/`),
};

export const analyticsApi = {
    getStats: (params) => api.get('analytics/stats/', { params }),
    getInventory: () => api.get('analytics/inventory/'),
};

export const backupsApi = {
    list: () => api.get('backups/'),
    create: () => api.post('backups/'),
    delete: (id) => api.delete(`backups/${id}/`),
    download: (id) => api.get(`backups/${id}/download/`, { responseType: 'blob' }),
    restore: (id) => api.post(`backups/${id}/restore/`),
    restoreFromUpload: (file) => {
        const formData = new FormData();
        formData.append('backup_file', file);
        return api.post('backups/restore-upload/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

export default api;
