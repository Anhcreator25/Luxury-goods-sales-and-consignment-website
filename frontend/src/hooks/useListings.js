import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../services/axiosClient';

/**
 * Custom hook to fetch luxury product listings with filtering, sorting, and manual refetch.
 * @param {Object} initialParams - Default query parameters (e.g. { status: 'active', limit: 8 })
 */
export function useListings(initialParams = { status: 'active' }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch listings from the remote backend with merged filters
  const fetchListings = useCallback(async (customParams = {}) => {
    setLoading(true);
    setError('');
    try {
      const mergedParams = { ...initialParams, ...customParams };
      const res = await axiosClient.get('/listings/get_listing', { params: mergedParams });
      const data = res.data?.data ?? res.data ?? [];
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi khi tải sản phẩm:', err);
      setError('Không thể tải danh sách sản phẩm.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [initialParams]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return {
    products,
    loading,
    error,
    refetch: fetchListings,
  };
}

