import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../services/axiosClient';

/**
 * Custom hook to manage shopping cart state, remote API synchronization,
 * and global 'cart-updated' custom event broadcasting.
 */
export function useCart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  // Fetch all cart items from backend
  const fetchCart = useCallback(async () => {
    if (!token) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axiosClient.get('/cart_items');
      const items = res.data?.data ?? res.data ?? [];
      setCartItems(Array.isArray(items) ? items : []);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Không thể tải giỏ hàng.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCart();

    const handleCartUpdate = () => fetchCart();
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, [fetchCart]);

  const addToCart = async (listingId, quantity = 1) => {
    try {
      const res = await axiosClient.post('/cart_items', {
        listing_id: listingId,
        quantity,
      });
      await fetchCart();
      window.dispatchEvent(new Event('cart-updated'));
      return { success: true, data: res.data };
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message || 'Không thể thêm vào giỏ hàng.';
      return { success: false, error: msg };
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await axiosClient.delete(`/cart_items/${cartItemId}`);
      setCartItems((prev) => prev.filter((item) => (item.cart_item_id || item.id) !== cartItemId));
      window.dispatchEvent(new Event('cart-updated'));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Không thể xóa sản phẩm khỏi giỏ hàng.' };
    }
  };

  const cartCount = cartItems.length;

  return {
    cartItems,
    cartCount,
    loading,
    error,
    fetchCart,
    addToCart,
    removeFromCart,
  };
}

