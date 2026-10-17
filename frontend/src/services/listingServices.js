import axiosClient from "./axiosClient";

/**
 * Service handling luxury product listings, search filters, and consignment items.
 */
export const listingServices = {
  /**
   * Fetch listings with optional search/filter parameters.
   * @param {Object} [params={}] - Filter params: status, category_id, title, limit, etc.
   * @returns {Promise<any>}
   */
  getListings: async (params = {}) => {
    return await axiosClient.get("/listings/get_listing", { params });
  },

  /**
   * Fetch single product detail by ID.
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  getListingById: async (id) => {
    return await axiosClient.get(`/listings/get_listing/${id}`);
  },

  /**
   * Create a new consignment listing.
   * @param {Object} data
   * @returns {Promise<any>}
   */
  createListing: async (data) => {
    return await axiosClient.post("/listings/create_listing", data);
  },

  /**
   * Update an existing listing.
   * @param {number|string} id
   * @param {Object} data
   * @returns {Promise<any>}
   */
  updateListing: async (id, data) => {
    return await axiosClient.put(`/listings/update/${id}`, data);
  },

  /**
   * Delete a listing.
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  deleteListing: async (id) => {
    return await axiosClient.delete(`/listings/delete/${id}`);
  },

  /**
   * Admin approve or reject a listing.
   * @param {number|string} id
   * @param {'active'|'rejected'} status
   * @returns {Promise<any>}
   */
  updateListingStatus: async (id, status) => {
    return await axiosClient.put(`/listings/admin/listing/${id}/status`, { status });
  },
};
