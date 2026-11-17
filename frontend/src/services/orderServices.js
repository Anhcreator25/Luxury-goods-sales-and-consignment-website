import axiosClient from "./axiosClient";

/**
 * Service handling customer orders and checkout operations.
 */
export const orderServices = {
  // Fetch order history for buyer
  getOrders: async () => {
    return await axiosClient.get("/orders");
  },

  // Fetch incoming orders for seller whose listings were purchased
  getSellerIncomingOrders: async () => {
    return await axiosClient.get("/orders/seller/incoming");
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

  // Cancel an unpaid pending order
  cancelOrder: async (orderId) => {
    return await axiosClient.put(`/orders/${orderId}/cancel`);
  },

  // Confirm receipt of order items by buyer
  confirmReceipt: async (orderId) => {
    return await axiosClient.put(`/orders/${orderId}/confirm-receipt`);
  },

  // Fetch all escrow payouts for admin
  getAdminEscrowPayouts: async () => {
    return await axiosClient.get("/orders/admin/escrow");
  },

  // Disburse escrow payout by admin
  disburseEscrowPayout: async (payoutId, payload) => {
    return await axiosClient.post(`/orders/admin/escrow/${payoutId}/disburse`, payload);
  },
};
