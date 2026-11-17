import pool from "../config/db.js";

// Create order from cart
export const createOrderServices = async (userId, orderData,cartItemId)=> {

       if(!cartItemId || !Array.isArray(cartItemId)|| cartItemId.length===0){
        const error = new Error("please choose at least product in cart to payment");
        error.status = 400;
        throw error;
       }    
       
       const { shipping_address , phone_number , payment_method} = orderData;

       const connection = await pool.getConnection();

       try {
            await connection.beginTransaction();

            //get infor product (including accepted offer price if within 24h)
            const [cartItems] = await connection.query(
                 `SELECT ci.listing_id, ci.quantity, 
                         COALESCE(
                             (SELECT o.offered_price 
                              FROM offers o 
                              WHERE o.listing_id = l.id 
                                AND o.buyer_id = ? 
                                AND o.status = 'accepted'
                                AND o.created_at >= NOW() - INTERVAL 24 HOUR
                              ORDER BY o.id DESC LIMIT 1),
                             l.selling_price
                         ) AS selling_price,
                         l.status, l.title 
                  FROM cart_items ci 
                  JOIN listings l ON ci.listing_id = l.id
                  WHERE ci.user_id =? AND ci.id IN (?)`,[userId, userId, cartItemId]);
            
            //Check if the shopping cart contains any items
            if(cartItems.length===0){
                const error = new Error("Shopping cart is empty");
                error.status= 400;
                throw error; } 
          
            // Check whether the number of submitted IDs matches
            if (cartItems.length !== cartItemId.length) {
                const error = new Error("Some selected items are invalid or do not belong to your cart.");
                error.status = 400;
                throw error; }

            // Go through each item in the shopping cart
            for(const item of cartItems){
                if(item.status!=='active'){
                    const error = new Error(`Product "${item.title}" is no longer available for sales.`);
                    error.status = 400;
                    throw error;
                }
            }
            
            // Calculate totalAmount & Platform Commission from ENV (default 5%)
            const totalAmount = cartItems.reduce((sum,item)=> sum + (item.selling_price * item.quantity),0);
            const COMMISSON_RATE = parseFloat(process.env.PLATFORM_COMMISSION_RATE) || 0.05;
            const commissionFee = Math.round(totalAmount * COMMISSON_RATE);
            const sellPayout = totalAmount - commissionFee;
            
            const normalizedMethod = payment_method || 'BANK_TRANSFER';
            
            const [orderResult] = await connection.query(
                     `INSERT INTO orders (buyer_id, total_amount,commission_Fee,seller_Payout,shipping_address, phone, payment_method, order_status, payment_status)
                      VALUES (?,?,?,?,?,?,?,'pending','pending')`,
                    [userId,totalAmount,commissionFee,sellPayout,shipping_address,phone_number,normalizedMethod]);
            
            const orderId = orderResult.insertId;

            // Generate VietQR URL for convenient mobile banking transfer from ENV
            const bankAccount = process.env.PLATFORM_BANK_ACCOUNT 
            const bankCode = process.env.PLATFORM_BANK_CODE 
            const accountHolder = process.env.PLATFORM_BANK_HOLDER 
            const bankName = process.env.PLATFORM_BANK_NAME 
            const transferContent = `DH${orderId}`;
            const qrUrl = `https://img.vietqr.io/image/${bankCode}-${bankAccount}-compact2.png?amount=${Math.round(totalAmount)}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountHolder)}`;

            const paymentUrl = `http://localhost:5050/api/orders/payment/simulate-checkout?orderId=${orderId}&amount=${totalAmount}`;

            // Create order_items details and update listings to 'sold'
            for (const item of cartItems) {
                await connection.query(
                    `INSERT INTO order_items (order_id, listing_id, price, quantity) VALUES (?, ?, ?, ?)`,
                    [orderId, item.listing_id, item.selling_price, item.quantity]
                );
             
                await connection.query(
                    `UPDATE listings SET status = 'sold' WHERE id = ?`,
                    [item.listing_id]
                );
            }

            await connection.query(`DELETE FROM cart_items WHERE user_id = ? AND id IN (?)`, [userId, cartItemId]);

            await connection.commit();

            return {
                success: true,
                orderId,
                totalAmount,
                commissionFee,
                sellPayout,
                payment_method: normalizedMethod,
                payment_url: paymentUrl,
                qr_url: qrUrl,
                bank_info: {
                    bank_code: bankCode,
                    bank_name: bankName,
                    account_number: bankAccount,
                    account_name: accountHolder,
                    amount: totalAmount,
                    transfer_content: transferContent
                },
                message: "Đơn hàng đã được tạo. Vui lòng hoàn tất thanh toán chuyển khoản trước để chúng tôi xử lý đơn."
            };

       } catch (error) {
             await connection.rollback();
             throw error;
       } finally{
             connection.release();  
       }
}

//Buyers view their placed orders, while sellers view the list of orders requiring delivery.
//Admin views all orders across the entire platform.
export const getOrderByRoleServices = async (user) => {
    const connection = await pool.getConnection();

    try {
        const isAdmin = user.role === 'admin';

        // Retrieve orders: all platform orders for admin, or only the user's orders for buyer
        const query = `
            SELECT 
                o.id AS order_id,
                o.id AS id,
                o.buyer_id,
                u.name AS buyer_name,
                u.email AS buyer_email,
                o.total_amount,
                o.total_amount AS total_price,
                o.commission_fee,
                o.seller_payout,
                o.shipping_address,
                o.phone,
                o.payment_method,
                o.order_status,
                o.order_status AS status,
                o.payment_status,
                o.created_at
            FROM orders o 
            LEFT JOIN users u ON o.buyer_id = u.id
            ${isAdmin ? '' : 'WHERE o.buyer_id = ?'}
            ORDER BY o.created_at DESC
        `;

        const [orders] = await connection.query(query, isAdmin ? [] : [user.id]);

        // Go through each order to retrieve the detailed list of products inside.
        for (let order of orders) {
            const [items] = await connection.query(`
                SELECT 
                   oi.id AS order_item_id,
                   oi.quantity,
                   oi.price,
                   l.id AS listing_id,
                   l.title AS product_title,
                   l.title AS title,
                   l.seller_id AS seller_id
                FROM order_items oi 
                JOIN listings l ON oi.listing_id = l.id
                WHERE oi.order_id = ?`, 
                [order.order_id]
            );
            
            order.items = items;
        }

        return orders;

    } finally {
        connection.release();
    }
};

// Retrieve incoming orders specifically for seller whose products were purchased
export const getSellerIncomingOrdersService = async (sellerId) => {
    const connection = await pool.getConnection();

    try {
        const query = `
            SELECT DISTINCT
                o.id AS order_id,
                o.id AS id,
                o.buyer_id,
                u.name AS buyer_name,
                u.email AS buyer_email,
                o.shipping_address,
                o.phone AS phone_number,
                o.total_amount,
                o.total_amount AS total_price,
                o.commission_fee,
                o.seller_payout,
                o.order_status,
                o.order_status AS status,
                o.payment_status,
                o.payment_method,
                o.created_at
            FROM orders o
            JOIN order_items oi ON oi.order_id = o.id
            JOIN listings l ON l.id = oi.listing_id
            JOIN users u ON u.id = o.buyer_id
            WHERE l.seller_id = ?
            ORDER BY o.created_at DESC
        `;

        const [orders] = await connection.query(query, [sellerId]);

        for (let order of orders) {
            const [items] = await connection.query(`
                SELECT 
                   oi.id AS order_item_id,
                   oi.quantity,
                   oi.price,
                   l.id AS listing_id,
                   l.title AS product_title,
                   l.title AS title,
                   l.seller_id AS seller_id,
                   (SELECT image_url FROM listing_images WHERE listing_id = l.id AND is_primary = 1 LIMIT 1) AS primary_image
                FROM order_items oi 
                JOIN listings l ON oi.listing_id = l.id
                WHERE oi.order_id = ? AND l.seller_id = ?`, 
                [order.order_id, sellerId]
            );
            
            order.items = items;
        }

        return orders;

    } finally {
        connection.release();
    }
};

//Update order status upon successful bank transfer payment
export const updatePaymentSuccessService = async (orderId) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [orders] = await connection.query(
            `SELECT id, payment_status, order_status FROM orders WHERE id = ? FOR UPDATE`,
            [orderId]
        );

        if (orders.length === 0) {
            const error = new Error("Order not found.");
            error.status = 404;
            throw error;
        }

        const order = orders[0];

        if (order.payment_status === 'paid') {
            await connection.commit();
            return { success: true, message: "Order is already paid." };
        }

        await connection.query(
            `UPDATE orders 
             SET payment_status = 'paid', order_status = 'confirmed' 
             WHERE id = ?`,
            [orderId]
        );

        await connection.commit();

        return {
            success: true,
            orderId,
            message: "Payment confirmed successfully! Order status updated to 'confirmed'."
        };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Cancel an unpaid order and release product listings back to 'active' status
export const cancelOrderServices = async (orderId, userId, userRole = 'user') => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [orders] = await connection.query(
            `SELECT id, buyer_id, payment_status, order_status FROM orders WHERE id = ? FOR UPDATE`,
            [orderId]
        );

        if (orders.length === 0) {
            const error = new Error("Đơn hàng không tồn tại.");
            error.status = 404;
            throw error;
        }

        const order = orders[0];

        // Security check: Only the buyer or an admin can cancel
        if (userRole !== 'admin' && Number(order.buyer_id) !== Number(userId)) {
            const error = new Error("Bạn không có quyền hủy đơn hàng này.");
            error.status = 403;
            throw error;
        }

        // Only allow cancel when order is still pending and unpaid
        if (order.payment_status === 'paid') {
            const error = new Error("Đơn hàng đã được thanh toán. Vui lòng liên hệ hỗ trợ để yêu cầu hoàn tiền.");
            error.status = 400;
            throw error;
        }

        if (order.order_status === 'cancelled') {
            await connection.commit();
            return { success: true, message: "Đơn hàng này đã được hủy trước đó." };
        }

        if (order.order_status !== 'pending') {
            const error = new Error(`Không thể hủy đơn hàng đang ở trạng thái "${order.order_status}".`);
            error.status = 400;
            throw error;
        }

        // 1. Update order status to 'cancelled'
        await connection.query(
            `UPDATE orders SET order_status = 'cancelled' WHERE id = ?`,
            [orderId]
        );

        // 2. Retrieve all listing_ids belonging to this order to restore their active status
        const [items] = await connection.query(
            `SELECT listing_id FROM order_items WHERE order_id = ?`,
            [orderId]
        );

        if (items.length > 0) {
            const listingIds = items.map(i => i.listing_id).filter(Boolean);
            if (listingIds.length > 0) {
                await connection.query(
                    `UPDATE listings SET status = 'active' WHERE id IN (?)`,
                    [listingIds]
                );
            }
        }

        await connection.commit();

        return {
            success: true,
            orderId,
            message: "Hủy đơn hàng thành công. Sản phẩm đã được hoàn trả lại sàn giao dịch."
        };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Confirm order delivery receipt by buyer and complete the order
export const confirmOrderReceiptService = async (orderId, userId) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Check order existence and ownership
        const [orders] = await connection.query(
            `SELECT id, buyer_id, total_amount, payment_status, order_status FROM orders WHERE id = ? FOR UPDATE`,
            [orderId]
        );

        if (orders.length === 0) {
            const error = new Error("Đơn hàng không tồn tại.");
            error.status = 404;
            throw error;
        }

        const order = orders[0];

        // Security check: Only the buyer can confirm receipt
        if (Number(order.buyer_id) !== Number(userId)) {
            const error = new Error("Bạn không có quyền xác nhận nhận hàng cho đơn hàng này.");
            error.status = 403;
            throw error;
        }

        // Only paid orders can be confirmed
        if (order.payment_status !== 'paid') {
            const error = new Error("Đơn hàng chưa được thanh toán thành công, không thể xác nhận nhận hàng.");
            error.status = 400;
            throw error;
        }

        if (order.order_status === 'completed') {
            await connection.commit();
            return { success: true, message: "Đơn hàng này đã được xác nhận hoàn thành trước đó." };
        }

        // 2. Update order status to completed
        await connection.query(
            `UPDATE orders SET order_status = 'completed' WHERE id = ?`,
            [orderId]
        );

        // 3. Ensure escrow record exists and ready for payout
        const [escrowRows] = await connection.query(
            `SELECT id FROM escrow_payouts WHERE order_id = ?`,
            [orderId]
        );

        if (escrowRows.length === 0) {
            // Find seller from order items
            const [itemRows] = await connection.query(
                `SELECT l.seller_id FROM order_items oi JOIN listings l ON l.id = oi.listing_id WHERE oi.order_id = ? LIMIT 1`,
                [orderId]
            );
            const sellerId = itemRows.length > 0 ? itemRows[0].seller_id : null;
            if (sellerId) {
                const commission = Math.round(Number(order.total_amount) * 0.05);
                await connection.query(
                    `INSERT INTO escrow_payouts (order_id, seller_id, amount, commission_fee, status) VALUES (?, ?, ?, ?, 'pending')`,
                    [orderId, sellerId, order.total_amount, commission]
                );
            }
        }

        await connection.commit();

        return {
            success: true,
            orderId,
            message: "Xác nhận nhận hàng thành công! Đơn hàng đã hoàn tất."
        };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Retrieve all escrow payouts with seller bank accounts for admin dashboard
export const getAdminEscrowPayoutsService = async () => {
    const connection = await pool.getConnection();

    try {
        const query = `
            SELECT 
                ep.id AS payout_id,
                ep.order_id,
                ep.seller_id,
                ep.amount,
                ep.commission_fee,
                (ep.amount - ep.commission_fee) AS net_payout,
                ep.status AS payout_status,
                ep.recipient_bank,
                ep.recipient_account,
                ep.recipient_name,
                ep.transaction_ref,
                ep.disbursed_at,
                ep.disbursed_by,
                ep.created_at,
                o.order_status,
                o.payment_status,
                u.name AS seller_name,
                u.email AS seller_email,
                uba.bank_name AS default_bank_name,
                uba.bank_account_number AS default_account_number,
                uba.bank_account_holder AS default_account_holder
            FROM escrow_payouts ep
            JOIN orders o ON o.id = ep.order_id
            JOIN users u ON u.id = ep.seller_id
            LEFT JOIN user_bank_accounts uba ON uba.user_id = ep.seller_id AND uba.is_default = 1
            ORDER BY ep.created_at DESC
        `;

        const [rows] = await connection.query(query);
        return rows;

    } finally {
        connection.release();
    }
};

// Disburse escrow payout and persist banking snapshot
export const disburseEscrowPayoutService = async (payoutId, adminId, data = {}) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [payouts] = await connection.query(
            `SELECT ep.*, o.order_status, uba.bank_name, uba.bank_account_number, uba.bank_account_holder
             FROM escrow_payouts ep
             JOIN orders o ON o.id = ep.order_id
             LEFT JOIN user_bank_accounts uba ON uba.user_id = ep.seller_id AND uba.is_default = 1
             WHERE ep.id = ? FOR UPDATE`,
            [payoutId]
        );

        if (payouts.length === 0) {
            const error = new Error("Bản ghi ký quỹ không tồn tại.");
            error.status = 404;
            throw error;
        }

        const payout = payouts[0];

        // Strict validation: Only allow disbursement when order is fully completed
        if (payout.order_status !== 'completed') {
            const error = new Error(`Không thể giải ngân! Đơn hàng #${payout.order_id} đang ở trạng thái "${payout.order_status}". Chỉ được giải ngân khi khách hàng đã bấm nhận hàng (completed).`);
            error.status = 400;
            throw error;
        }

        const recipientBank = data.recipient_bank || payout.bank_name;
        const recipientAccount = data.recipient_account || payout.bank_account_number;
        const recipientName = data.recipient_name || payout.bank_account_holder;

        // Strict validation: Seller must have linked a valid bank account
        if (!recipientAccount || !recipientBank) {
            const error = new Error(`Không thể giải ngân! Người bán chưa cung cấp tài khoản ngân hàng để nhận tiền.`);
            error.status = 400;
            throw error;
        }

        if (payout.status === 'completed') {
            await connection.commit();
            return { success: true, message: "Khoản ký quỹ này đã được giải ngân trước đó." };
        }

        const transactionRef = data.transaction_ref ? data.transaction_ref.trim() : null;
        const note = data.note ? data.note.trim() : null;

        await connection.query(
            `UPDATE escrow_payouts 
             SET status = 'completed',
                 recipient_bank = ?,
                 recipient_account = ?,
                 recipient_name = ?,
                 transaction_ref = ?,
                 disbursed_by = ?,
                 disbursed_at = NOW(),
                 note = ?
             WHERE id = ?`,
            [recipientBank, recipientAccount, recipientName, transactionRef, adminId, note, payoutId]
        );

        await connection.commit();

        return {
            success: true,
            payoutId,
            message: "Giải ngân thành công! Đã lưu trữ chứng từ thanh toán."
        };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};
