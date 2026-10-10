import pool from "../config/db.js";

// Get list product in Cart
export const getCartServices = async (userId) => {
    const query = `
        SELECT ci.id AS cart_item_id, ci.quantity,
               l.id AS listing_id, l.title, l.selling_price, l.condition_grade,
               li.image_url AS primary_image,
               u.name AS seller_name
        FROM cart_items ci
        JOIN listings l ON ci.listing_id = l.id  
        LEFT JOIN listing_images li ON l.id = li.listing_id AND li.is_primary = 1
        LEFT JOIN users u ON l.seller_id = u.id
        WHERE ci.user_id = ? AND l.status = 'active'
    `;
    
    const [items] = await pool.query(query, [userId]);
    return items;            
}

// Add product into Cart
export const addToCartServices = async (userId, listing_id) => {
    const [listing] = await pool.query(
        `SELECT id, seller_id, status FROM listings WHERE id = ? AND status = ?`, 
        [listing_id, 'active']
    );

    if (listing.length === 0) {
        throw { status: 404, message: "The product does not exist or is no longer available for sale." };
    }
    if (listing[0].seller_id === userId) {
        throw { status: 400, message: "You cannot add products you have listed yourself to the shopping cart." };
    }

    const [existing] = await pool.query(
        `SELECT id, quantity FROM cart_items WHERE user_id = ? AND listing_id = ?`, 
        [userId, listing_id]
    );
         
    if (existing.length > 0) {
        throw { status: 400, message: "The product is already in the cart." };
    }

    await pool.query(
        `INSERT INTO cart_items (user_id, listing_id, quantity) VALUES (?, ?, 1)`, 
        [userId, listing_id]
    );

    return { message: "Product successfully added to cart." };
}

// Remove product from cart
export const removeCartItemServices = async (userId, cartItemId) => {
    const [result] = await pool.query(
        `DELETE FROM cart_items WHERE id = ? AND user_id = ?`, 
        [cartItemId, userId]
    );

    if (result.affectedRows === 0) {
        throw { status: 404, message: "The product does not exist in your shopping cart." };
    }

    return { message: "Product removed from cart" };
}