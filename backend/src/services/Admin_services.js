import pool from "../config/db.js";

const PAID_ORDER_CONDITION = "(o.payment_status = 'paid' OR o.order_status IN ('confirmed', 'completed', 'shipping'))";

// Clamps pagination inputs to safe positive bounds
const normalizePagination = (page, limit, defaultLimit = 10) => {
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || defaultLimit));
    return {
        page: safePage,
        limit: safeLimit,
        offset: (safePage - 1) * safeLimit
    };
};

// Aggregates key KPI metrics for Admin Dashboard via SQL Aggregation
export const getAdminStatsService = async () => {
    const connection = await pool.getConnection();
    try {
        const [
            [orderStats],
            [commissionStats],
            [listingStats],
            [userStats]
        ] = await Promise.all([
            connection.query(`
                SELECT 
                    COUNT(*) as total_orders,
                    SUM(CASE 
                        WHEN ${PAID_ORDER_CONDITION} 
                        THEN 1 ELSE 0 
                    END) as paid_orders,
                    SUM(CASE 
                        WHEN o.order_status = 'cancelled' 
                        THEN 1 ELSE 0 
                    END) as cancelled_orders,
                    SUM(CASE 
                        WHEN (o.payment_status != 'paid' OR o.payment_status IS NULL) 
                             AND o.order_status NOT IN ('confirmed', 'completed', 'shipping', 'cancelled') 
                        THEN 1 ELSE 0 
                    END) as pending_orders,
                    COALESCE(SUM(CASE 
                        WHEN ${PAID_ORDER_CONDITION} 
                        THEN o.total_amount ELSE 0 
                    END), 0) as total_revenue
                FROM orders o
            `),

            // 2. Realized Commission from Successfully Disbursed Escrow Payouts & Pending Disbursements
            connection.query(`
                SELECT 
                    COALESCE(SUM(CASE WHEN ep.status = 'completed' THEN ep.commission_fee ELSE 0 END), 0) as realized_commission,
                    COALESCE(SUM(CASE WHEN ep.status = 'pending' AND o.order_status = 'completed' THEN ep.amount * 0.95 ELSE 0 END), 0) as pending_disburse_amount,
                    COUNT(CASE WHEN ep.status = 'pending' AND o.order_status = 'completed' THEN 1 END) as pending_disburse_count
                FROM escrow_payouts ep
                JOIN orders o ON o.id = ep.order_id
            `),

            // 3. Listing (Product) Metrics
            connection.query(`
                SELECT 
                    COUNT(*) as total_listings,
                    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_listings,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_listings,
                    SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as sold_listings,
                    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_listings
                FROM listings
            `),

            // 4. Platform Member Metrics
            connection.query(`
                SELECT 
                    COUNT(*) as total_users,
                    SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as total_admins,
                    SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as regular_users
                FROM users
            `)
        ]);

        return {
            revenue: Number(orderStats[0]?.total_revenue || 0),
            commission: Math.round(Number(commissionStats[0]?.realized_commission || 0)),
            orders: Number(orderStats[0]?.total_orders || 0),
            paidOrders: Number(orderStats[0]?.paid_orders || 0),
            pendingOrders: Number(orderStats[0]?.pending_orders || 0),
            cancelledOrders: Number(orderStats[0]?.cancelled_orders || 0),
            activeProducts: Number(listingStats[0]?.active_listings || 0),
            pendingProducts: Number(listingStats[0]?.pending_listings || 0),
            totalProducts: Number(listingStats[0]?.total_listings || 0),
            pendingDisburseAmount: Number(commissionStats[0]?.pending_disburse_amount || 0),
            pendingDisburseCount: Number(commissionStats[0]?.pending_disburse_count || 0),
            totalUsers: Number(userStats[0]?.total_users || 0),
            regularUsers: Number(userStats[0]?.regular_users || 0),
        };
    } finally {
        connection.release();
    }
};

/**
 * Retrieves time-series revenue and GMV data for analytics chart rendering with multi-dimensional grouping and custom date filters.
 * @param {Object} options
 * @param {string} options.range '7days' | '30days' | 'year' | 'custom'
 * @param {string} options.groupBy 'day' | 'month' | 'year'
 * @param {string} [options.startDate] 'YYYY-MM-DD'
 * @param {string} [options.endDate] 'YYYY-MM-DD'
 * @param {string} [options.status] 'all' | 'paid' | 'completed'
 */
export const getRevenueAnalyticsService = async ({
    range = '7days',
    groupBy = 'day',
    startDate,
    endDate,
    status = 'all'
} = {}) => {
    const connection = await pool.getConnection();
    try {
        let dateFormat = "%Y-%m-%d";
        if (groupBy === 'month') {
            dateFormat = "%Y-%m";
        } else if (groupBy === 'year') {
            dateFormat = "%Y";
        }

        const params = [];
        let whereClauses = [];

        // 1. Time range filtering (validate YYYY-MM-DD for custom dates)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (startDate && endDate) {
            if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
                const err = new Error('Invalid date format. Expected YYYY-MM-DD.');
                err.status = 400;
                throw err;
            }
            whereClauses.push("o.created_at >= ? AND o.created_at <= ?");
            params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
        } else if (range === '30days') {
            whereClauses.push("o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)");
        } else if (range === 'year') {
            whereClauses.push("o.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)");
        } else {
            whereClauses.push("o.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)");
        }

        // 2. Status filtering condition for revenue
        let revenueStatusCondition = PAID_ORDER_CONDITION;
        if (status === 'completed') {
            revenueStatusCondition = "o.order_status = 'completed'";
        } else if (status === 'paid') {
            revenueStatusCondition = "o.payment_status = 'paid'";
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const query = `
            SELECT 
                DATE_FORMAT(o.created_at, '${dateFormat}') as date_label,
                COALESCE(SUM(CASE 
                    WHEN ${revenueStatusCondition} 
                    THEN o.total_amount ELSE 0 
                END), 0) as gmv,
                COALESCE(SUM(ep.completed_commission), 0) as estimated_commission,
                COUNT(DISTINCT CASE 
                    WHEN ${revenueStatusCondition}
                    THEN o.id 
                END) as order_count
            FROM orders o
            LEFT JOIN (
                SELECT 
                    order_id, 
                    SUM(CASE WHEN status = 'completed' THEN commission_fee ELSE 0 END) as completed_commission
                FROM escrow_payouts
                GROUP BY order_id
            ) ep ON ep.order_id = o.id
            ${whereSql}
            GROUP BY DATE_FORMAT(o.created_at, '${dateFormat}')
            ORDER BY date_label ASC
        `;

        const [rows] = await connection.query(query, params);

        const series = rows.map(r => ({
            date: r.date_label,
            gmv: Number(r.gmv || 0),
            commission: Math.round(Number(r.estimated_commission || 0)),
            orderCount: Number(r.order_count || 0)
        }));

        // Compute summary metrics for the selected window
        const totalGmv = series.reduce((sum, item) => sum + item.gmv, 0);
        const totalCommission = series.reduce((sum, item) => sum + item.commission, 0);
        const totalOrders = series.reduce((sum, item) => sum + item.orderCount, 0);
        const aov = totalOrders > 0 ? Math.round(totalGmv / totalOrders) : 0;

        return {
            summary: {
                totalGmv,
                totalCommission,
                totalOrders,
                aov,
                groupBy,
                range
            },
            series
        };
    } finally {
        connection.release();
    }
};

// Retrieves paginated admin order list with keyword search and status filtering
export const getAdminOrdersService = async ({ page = 1, limit = 10, status = 'all', search = '' }) => {
    const connection = await pool.getConnection();
    try {
        const { page: safePage, limit: safeLimit, offset } = normalizePagination(page, limit, 10);
        const params = [];
        let whereClauses = [];

        if (status === 'paid') {
            whereClauses.push(PAID_ORDER_CONDITION);
        } else if (status === 'pending') {
            whereClauses.push("((o.payment_status != 'paid' OR o.payment_status IS NULL) AND o.order_status NOT IN ('confirmed', 'completed', 'shipping', 'cancelled'))");
        } else if (status === 'cancelled') {
            whereClauses.push("o.order_status = 'cancelled'");
        }

        // Search by Order ID, Buyer Name, or Email
        if (search && search.trim() !== '') {
            whereClauses.push("(CAST(o.id AS CHAR) LIKE ? OR u.name LIKE ? OR u.email LIKE ?)");
            const searchTerm = `%${search.trim()}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        // Total record count
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM orders o
            JOIN users u ON o.buyer_id = u.id
            ${whereSql}
        `;
        const [countResult] = await connection.query(countQuery, params);
        const total = countResult[0]?.total || 0;

        // Query paginated orders with aggregated items
        const dataQuery = `
            SELECT 
                o.id as order_id,
                o.buyer_id,
                u.name as buyer_name,
                u.email as buyer_email,
                o.total_amount,
                o.shipping_address,
                o.phone as phone_number,
                o.order_status,
                o.payment_status,
                o.created_at,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'listing_id', oi.listing_id,
                            'title', l.title,
                            'price', oi.price,
                            'quantity', oi.quantity
                        )
                    )
                    FROM order_items oi
                    JOIN listings l ON oi.listing_id = l.id
                    WHERE oi.order_id = o.id
                ) as items
            FROM orders o
            JOIN users u ON o.buyer_id = u.id
            ${whereSql}
            ORDER BY o.id DESC
            LIMIT ? OFFSET ?
        `;

        const [rows] = await connection.query(dataQuery, [...params, safeLimit, offset]);

        return {
            total,
            page: safePage,
            limit: safeLimit,
            totalPages: Math.ceil(total / safeLimit),
            orders: rows.map(r => ({
                ...r,
                items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || [])
            }))
        };
    } finally {
        connection.release();
    }
};

// Retrieves paginated platform users with aggregated listing & purchase metrics
export const getAdminUsersService = async ({ page = 1, limit = 15, search = '', role = 'all' }) => {
    const connection = await pool.getConnection();
    try {
        const { page: safePage, limit: safeLimit, offset } = normalizePagination(page, limit, 15);
        const params = [];
        let whereClauses = [];

        if (role && role !== 'all') {
            whereClauses.push("u.role = ?");
            params.push(role);
        }

        if (search && search.trim() !== '') {
            whereClauses.push("(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)");
            const searchTerm = `%${search.trim()}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        // 1. Count filtered users
        const [countRes] = await connection.query(`SELECT COUNT(*) as total FROM users u ${whereSql}`, params);
        const total = countRes[0]?.total || 0;

        // 2. Query users joined with aggregated listing & purchase metrics
        const dataQuery = `
            SELECT 
                u.id,
                u.name,
                u.email,
                u.phone,
                u.role,
                u.created_at,
                COALESCE(l_stats.total_listings, 0) as total_listings,
                COALESCE(o_stats.total_purchases, 0) as total_purchases
            FROM users u
            LEFT JOIN (
                SELECT seller_id, COUNT(*) as total_listings 
                FROM listings 
                GROUP BY seller_id
            ) l_stats ON l_stats.seller_id = u.id
            LEFT JOIN (
                SELECT buyer_id, COUNT(*) as total_purchases 
                FROM orders 
                GROUP BY buyer_id
            ) o_stats ON o_stats.buyer_id = u.id
            ${whereSql}
            ORDER BY u.id DESC
            LIMIT ? OFFSET ?
        `;

        const [users] = await connection.query(dataQuery, [...params, safeLimit, offset]);

        return {
            total,
            page: safePage,
            limit: safeLimit,
            totalPages: Math.ceil(total / safeLimit),
            users
        };
    } finally {
        connection.release();
    }
};
