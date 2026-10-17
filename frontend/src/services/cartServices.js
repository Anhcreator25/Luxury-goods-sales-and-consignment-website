import axiosClient from "./axiosClient";

/**
 * Service handling shopping cart API operations.
 */
export const cartServices = {
  /**
   * Get all items currently in the authenticated user's cart.
   * @returns {Promise<any>}
   */
  getCart: async () => {
    return await axiosClient.get("/cart_items");
  },

  /**
   * Add a product listing to cart.
   * @param {number|string} listingId
   * @param {number} [quantity=1]
   * @returns {Promise<any>}
   */
  addToCart: async (listingId, quantity = 1) => {
    return await axiosClient.post("/cart_items", {
      listing_id: listingId,
      quantity,
    });
  },

  /**
   * Remove an item from the cart by its cart item ID.
   * @param {number|string} id
   * @returns {Promise<any>}
   */
  removeCartItem: async (id) => {
    return await axiosClient.delete(`/cart_items/${id}`);
  },
};

