import pool from "../config/db.js";

/**
 * Aggregates key KPI metrics for Admin Dashboard via SQL Aggregation.
 * Optimization: Concurrent execution via Promise.all across database connection pool.
 */
export const getAdminStatsService = async () => {
    const connection = await pool.getConnection();
    try {
        const [
            [orderStats],
            [commissionStats],
            [listingStats],
            [userStats]
        ] = await Promise.all([
            // 1. Order and Revenue Metrics
            connection.query(`
                SELECT 
                    COUNT(*) as total_orders,
                    SUM(CASE 
                        WHEN payment_status = 'paid' OR order_status IN ('confirmed', 'completed', 'shipping') 
                        THEN 1 ELSE 0 
                    END) as paid_orders,
                    SUM(CASE 
                        WHEN order_status = 'cancelled' 
                        THEN 1 ELSE 0 
                    END) as cancelled_orders,
                    SUM(CASE 
                        WHEN (payment_status != 'paid' OR payment_status IS NULL) 
                             AND order_status NOT IN ('confirmed', 'completed', 'shipping', 'cancelled') 
                        THEN 1 ELSE 0 
                    END) as pending_orders,
                    COALESCE(SUM(CASE 
                        WHEN payment_status = 'paid' OR order_status IN ('confirmed', 'completed', 'shipping') 
                        THEN total_amount ELSE 0 
                    END), 0) as total_revenue
                FROM orders
            `),

            // 2. Realized Commission & Pending Escrow Disbursements
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
 * Retrieves time-series revenue and GMV data for analytics chart rendering.
 * @param {string} range '7days' | '30days' | 'year'
 */
export const getRevenueAnalyticsService = async (range = '7days') => {
    const connection = await pool.getConnection();
    try {
        let intervalSql = "INTERVAL 7 DAY";
        let dateFormat = "%Y-%m-%d";

        if (range === '30days') {
            intervalSql = "INTERVAL 30 DAY";
        } else if (range === 'year') {
            intervalSql = "INTERVAL 1 YEAR";
            dateFormat = "%Y-%m";
        }

        const query = `
            SELECT 
                DATE_FORMAT(o.created_at, '${dateFormat}') as date,
                COALESCE(SUM(CASE 
                    WHEN o.payment_status = 'paid' OR o.order_status IN ('confirmed', 'completed', 'shipping') 
                    THEN o.total_amount ELSE 0 
                END), 0) as gmv,
                COALESCE(SUM(CASE 
                    WHEN o.payment_status = 'paid' OR o.order_status IN ('confirmed', 'completed', 'shipping') 
                    THEN o.total_amount * 0.05 ELSE 0 
                END), 0) as estimated_commission,
                COUNT(o.id) as order_count
            FROM orders o
            WHERE o.created_at >= DATE_SUB(CURDATE(), ${intervalSql})
            GROUP BY DATE_FORMAT(o.created_at, '${dateFormat}')
            ORDER BY date ASC
        `;

        const [rows] = await connection.query(query);
        return rows.map(r => ({
            date: r.date,
            gmv: Number(r.gmv || 0),
            commission: Math.round(Number(r.estimated_commission || 0)),
            orderCount: Number(r.order_count || 0)
        }));
    } finally {
        connection.release();
    }
};

/**
 * Retrieves paginated admin order list with keyword search and status filtering.
 * Normalized schema: uses o.buyer_id
 */
export const getAdminOrdersService = async ({ page = 1, limit = 10, status = 'all', search = '' }) => {
    const connection = await pool.getConnection();
    try {
        const offset = (Number(page) - 1) * Number(limit);
        const params = [];
        let whereClauses = [];

        // Status filtering
        if (status === 'paid') {
            whereClauses.push("(o.payment_status = 'paid' OR o.order_status IN ('confirmed', 'completed', 'shipping'))");
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

        const [rows] = await connection.query(dataQuery, [...params, Number(limit), Number(offset)]);

        return {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
            orders: rows.map(r => ({
                ...r,
                items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || [])
            }))
        };
    } finally {
        connection.release();
    }
};

/**
 * Retrieves complete list of platform users.
 * Optimization: Derived Table JOIN eliminates N+1 Correlated Subqueries.
 */
export const getAdminUsersService = async ({ page = 1, limit = 15, search = '', role = 'all' }) => {
    const connection = await pool.getConnection();
    try {
        const offset = (Number(page) - 1) * Number(limit);
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

        const [users] = await connection.query(dataQuery, [...params, Number(limit), Number(offset)]);

        return {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
            users
        };
    } finally {
        connection.release();
    }
};
