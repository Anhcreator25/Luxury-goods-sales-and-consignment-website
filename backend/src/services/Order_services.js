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
