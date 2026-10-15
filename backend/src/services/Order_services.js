import pool from "../config/db.js";


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

            //get infor product
            const [cartItems] = await connection.query(
                 `SELECT ci.listing_id, ci.quantity, l.selling_price, l.status, l.title 
                  FROM cart_items ci 
                  JOIN listings l ON ci.listing_id = l.id
                  WHERE ci.user_id =? AND ci.id IN (?)`,[userId,cartItemId]);
            
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
            
            //Caculate totalAmount 
            const totalAmount = cartItems.reduce((sum,item)=> sum + (item.selling_price * item.quantity),0);
            const COMMISSON_RATE = 0.15;
            const commissionFee= totalAmount*COMMISSON_RATE;
            const sellPayout = totalAmount-commissionFee;
            
            
            const [orderResult] = await connection.query(
                     `INSERT INTO orders (buyer_id, total_amount,commission_Fee,seller_Payout,shipping_address, phone, payment_method, order_status, payment_status)
                      VALUES (?,?,?,?,?,?,?,'pending','pending')`,
                    [userId,totalAmount,commissionFee,sellPayout,shipping_address,phone_number,payment_method]);
            
            const orderId =orderResult.insertId;
            
            

        
     
        let paymentUrl = null;
        if (payment_method === 'banking') {
            // link payment by banking
            paymentUrl = `http://localhost:5050/api/orders/payment/simulate-checkout?orderId=${orderId}&amount=${totalAmount}`;
        }
       

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
            payment_method,
            payment_url: paymentUrl, 
            message: payment_method === 'banking' 
                ? "Order created successfully. Please proceed with banking payment." 
                : "Order created successfully (COD)."
        };

       } catch (error) {
            
             await connection.rollback();
             throw error;
        
       } finally{
             connection.release();  
       }
}

//Buyers view their placed orders, while sellers view the list of orders requiring delivery.
export const getOrderByRoleServices = async (user) => {
    const connection = await pool.getConnection();

    try {
        // Simply retrieve the orders placed by this specific user.
        const query = `
            SELECT 
                o.id AS order_id,
                o.total_amount,
                o.commission_fee,
                o.seller_payout,
                o.shipping_address,
                o.phone,
                o.payment_method,
                o.order_status,
                o.payment_status,
                o.created_at
            FROM orders o 
            WHERE o.buyer_id = ?
            ORDER BY o.created_at DESC
        `;

        const [orders] = await connection.query(query, [user.id]);

        // Go through each order to retrieve the detailed list of products inside.
        for (let order of orders) {
            const [items] = await connection.query(`
                SELECT 
                   oi.id AS order_item_id,
                   oi.quantity,
                   oi.price,
                   l.id AS listing_id,
                   l.title AS product_title,
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