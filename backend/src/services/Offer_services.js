import pool from '../config/db.js';

/**
 * 1. Create a new offer
 */
export const createOfferService = async ({ buyerId, listingId, offeredPrice, buyerNote }) => {
  // Validate listing exists and is active
  const [listings] = await pool.query(
    'SELECT id, seller_id, selling_price, status, title FROM listings WHERE id = ?',
    [listingId]
  );

  if (listings.length === 0) {
    throw { status: 404, message: 'Sản phẩm không tồn tại.' };
  }

  const listing = listings[0];

  if (listing.status !== 'active') {
    throw { status: 400, message: 'Sản phẩm hiện không trong trạng thái mở bán.' };
  }

  if (Number(listing.seller_id) === Number(buyerId)) {
    throw { status: 400, message: 'Bạn không thể tự trả giá sản phẩm của chính mình.' };
  }

  const numOffered = Number(offeredPrice);
  if (!numOffered || numOffered <= 0) {
    throw { status: 400, message: 'Vui lòng nhập mức giá đề xuất hợp lệ.' };
  }

  // Prevent absurd offers lower than 30% of listing price
  if (numOffered < Number(listing.selling_price) * 0.3) {
    throw { status: 400, message: 'Giá đề xuất không được thấp hơn 30% giá niêm yết.' };
  }

  const [result] = await pool.query(
    `INSERT INTO offers (listing_id, buyer_id, offered_price, buyer_note, status)
     VALUES (?, ?, ?, ?, 'pending')`,
    [listingId, buyerId, numOffered, buyerNote ? String(buyerNote).trim() : null]
  );

  return {
    id: result.insertId,
    listing_id: listingId,
    buyer_id: buyerId,
    offered_price: numOffered,
    buyer_note: buyerNote,
    status: 'pending',
  };
};

/**
 * 2. Get offers received by the seller for their listings
 */
export const getReceivedOffersService = async (sellerId) => {
  const query = `
    SELECT 
      o.id, o.listing_id, o.buyer_id, o.offered_price, o.buyer_note, o.status, o.created_at,
      l.title AS listing_title, l.selling_price AS listing_price,
      u.name AS buyer_name, u.email AS buyer_email,
      (SELECT image_url FROM listing_images WHERE listing_id = l.id ORDER BY is_primary DESC, id ASC LIMIT 1) AS primary_image
    FROM offers o
    JOIN listings l ON o.listing_id = l.id
    JOIN users u ON o.buyer_id = u.id
    WHERE l.seller_id = ?
    ORDER BY o.created_at DESC
  `;
  const [rows] = await pool.query(query, [sellerId]);
  return rows;
};

/**
 * 3. Get offers sent by the buyer
 */
export const getSentOffersService = async (buyerId) => {
  const query = `
    SELECT 
      o.id, o.listing_id, o.offered_price, o.buyer_note, o.status, o.created_at,
      l.title AS listing_title, l.selling_price AS listing_price, l.status AS listing_status,
      s.name AS seller_name,
      (SELECT image_url FROM listing_images WHERE listing_id = l.id ORDER BY is_primary DESC, id ASC LIMIT 1) AS primary_image
    FROM offers o
    JOIN listings l ON o.listing_id = l.id
    JOIN users s ON l.seller_id = s.id
    WHERE o.buyer_id = ?
    ORDER BY o.created_at DESC
  `;
  const [rows] = await pool.query(query, [buyerId]);
  return rows;
};

/**
 * 4. Seller responds to an offer (accept / reject)
 */
export const respondOfferService = async ({ offerId, sellerId, action }) => {
  const normalizedAction = String(action).toLowerCase();
  if (!['accepted', 'rejected'].includes(normalizedAction)) {
    throw { status: 400, message: "Hành động chỉ có thể là 'accepted' hoặc 'rejected'." };
  }

  // Check offer and verify seller ownership
  const query = `
    SELECT o.id, o.listing_id, o.status, l.seller_id
    FROM offers o
    JOIN listings l ON o.listing_id = l.id
    WHERE o.id = ?
  `;
  const [rows] = await pool.query(query, [offerId]);

  if (rows.length === 0) {
    throw { status: 404, message: 'Đề xuất giá không tồn tại.' };
  }

  const offer = rows[0];

  if (Number(offer.seller_id) !== Number(sellerId)) {
    throw { status: 403, message: 'Bạn không có quyền phản hồi đề xuất này.' };
  }

  if (offer.status !== 'pending') {
    throw { status: 400, message: `Đề xuất giá đã ở trạng thái ${offer.status}.` };
  }

  await pool.query('UPDATE offers SET status = ? WHERE id = ?', [normalizedAction, offerId]);

  return { id: offerId, status: normalizedAction };
};
