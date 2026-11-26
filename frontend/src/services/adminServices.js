import axiosClient from './axiosClient';

export const adminServices = {
    // Retrieves overview KPI metrics (server-side aggregation)
    getStats: () => {
        return axiosClient.get('/admin/stats');
    },

    // Retrieves revenue chart data with multi-dimensional filters ('day' | 'month' | 'year', range, startDate, endDate, status)
    getRevenueAnalytics: (params = {}) => {
        return axiosClient.get('/admin/revenue-analytics', { params });
    },

    // Retrieves paginated order list with search and status filters
    getOrders: (params = {}) => {
        return axiosClient.get('/admin/orders', { params });
    },

    // Retrieves paginated platform user list with activity metrics
    getUsers: (params = {}) => {
        return axiosClient.get('/admin/users', { params });
    },
};
