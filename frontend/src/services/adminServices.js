import axiosClient from './axiosClient';

export const adminServices = {
    // Retrieves overview KPI metrics (server-side aggregation)
    getStats: () => {
        return axiosClient.get('/admin/stats');
    },

    // Retrieves revenue chart data for a specific time range ('7days' | '30days' | 'year')
    getRevenueAnalytics: (range = '7days') => {
        return axiosClient.get('/admin/revenue-analytics', { params: { range } });
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
