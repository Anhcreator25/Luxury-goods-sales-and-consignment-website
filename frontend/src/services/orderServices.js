import axiosClient from "./axiosClient";

/**
 * Service handling customer orders and checkout operations.
 */
export const orderServices = {
  /**
   * Fetch order history (buyer orders, seller incoming orders, or admin overview).
   * @returns {Promise<any>}
   */
  getOrders: async () => {
    return await axiosClient.get("/orders");
  },

  /**
   * Create a new purchase order from cart items.
   * @param {Object} orderData
   * @param {string} orderData.shipping_address
   * @param {string} orderData.phone_number
   * @param {string} orderData.payment_method
   * @param {Array<number|string>} orderData.cartItemId
   * @returns {Promise<any>}
   */
  createOrder: async (orderData) => {
    return await axiosClient.post("/orders", orderData);
  },

  /**
   * Simulate a successful checkout payment webhook/callback.
   * @param {number|string} orderId
   * @returns {Promise<any>}
   */
  simulatePayment: async (orderId) => {
    return await axiosClient.get("/orders/payment/simulate-checkout", {
      params: { orderId },
    });
  },
};

