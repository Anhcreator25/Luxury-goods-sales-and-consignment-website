import * as adminService from '../services/Admin_services.js';

// GET /api/admin/stats
export const getAdminStatsController = async (req, res) => {
    try {
        const stats = await adminService.getAdminStatsService();
        return res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('getAdminStatsController error:', error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Lỗi server khi lấy thống kê admin.'
        });
    }
};

// GET /api/admin/revenue-analytics
export const getRevenueAnalyticsController = async (req, res) => {
    try {
        const {
            range = '7days',
            groupBy = 'day',
            startDate,
            endDate,
            status = 'all'
        } = req.query;

        const analytics = await adminService.getRevenueAnalyticsService({
            range,
            groupBy,
            startDate,
            endDate,
            status
        });
        return res.status(200).json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('getRevenueAnalyticsController error:', error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Lỗi server khi lấy dữ liệu phân tích doanh thu.'
        });
    }
};

// GET /api/admin/orders
export const getAdminOrdersController = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'all', search = '' } = req.query;
        const result = await adminService.getAdminOrdersService({
            page,
            limit,
            status,
            search
        });
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('getAdminOrdersController error:', error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Lỗi server khi lấy danh sách đơn hàng cho admin.'
        });
    }
};

// GET /api/admin/users
export const getAdminUsersController = async (req, res) => {
    try {
        const { page = 1, limit = 15, search = '', role = 'all' } = req.query;
        const result = await adminService.getAdminUsersService({
            page,
            limit,
            search,
            role
        });
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('getAdminUsersController error:', error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Lỗi server khi lấy danh sách người dùng cho admin.'
        });
    }
};
