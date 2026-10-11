import pool from "../config/db.js";

export const createOrderServices = async (userId, orderData,cartItemId)=> {
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
            
            const [orderResult] = await connection.query(
                     `INSERT INTO orders (buyer_id, total_amount, shipping_address, phone, payment_method, order_status, payment_status)
                      VALUE (?,?,?,?,?,'pending','pending')`,
                    [userId,totalAmount,shipping_address,phone_number,payment_method]);
            
            const orderId =orderResult.insertId;
            
            //Create a new order record.
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
            await connection.query(`DELETE FROM cart_items WHERE user_id=? AND id IN(?)`,[userId,cartItemId]);

            await connection.commit();

            return {
                orderId,
                totalAmount,
                message :"Order created successfully from shopping cart" }

       } catch (error) {
            
             await connection.rollback();
             throw error;
        
       } finally{
             connection.release();  
       }
}

//Buyers view their placed orders, while sellers view the list of orders requiring delivery.
export const getOrderByRoleServices = async(user) => {
       const connection = await pool.getConnection();
   
       try {
           let query="";
           let queryParams=[user.id];
            // if user is seller
           if(user.role ==="seller"){
              query= `SELECT DISTINCT
                        o.id AS order_id,
                        o.total_amount,
                        o.shipping_address,
                        o.phone,
                        o.payment_method,
                        o.order_status,
                        o.created_at
                      FROM orders o 
                      JOIN order_items oi ON o.id = oi.order_id
                      JOIN listings l ON oi.listing_id= l.id
                      WHERE l.seller_id =?
                      ORDER BY o.created_at DESC `
           }
           //if user is buyer
           else{
             query =`SELECT DISTINCT
                        o.id AS order_id,
                        o.total_amount,
                        o.shipping_address,
                        o.phone,
                        o.payment_method,
                        o.order_status,
                        o.created_at
                      FROM orders o 
                      WHERE o.buyer_id=?
                      ORDER BY o.created_at DESC `;
           }

        const[orders] = await connection.query(query,queryParams);

               //Go through each order to retrieve product details.   
                for(let order of orders){
                    const[items] = await connection.query(`
                        SELECT 
                           oi.id AS order_item_id,
                           oi.quantity,
                           oi.price,
                           l.id as listing_id,
                           l.title as product_title,
                           l.seller_id as seller_id
                        FROM order_items oi 
                        JOIN listings l ON oi.listing_id = l.id
                        WHERE oi.order_id =?`,[order.order_id]);
                    order.items=items
                }
                return orders;

       } finally {
               connection.release();
              
       }
}