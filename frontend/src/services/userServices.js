import axiosClient from "./axiosClient";

// Service handling user bank accounts and payout destinations
export const userServices = {
  // Fetch all linked bank accounts for current user
  getBankAccounts: async () => {
    return await axiosClient.get("/users/bank-accounts");
  },

  // Link a new bank account
  addBankAccount: async (data) => {
    return await axiosClient.post("/users/bank-accounts", data);
  },

  // Delete a linked bank account by ID
  deleteBankAccount: async (accountId) => {
    return await axiosClient.delete(`/users/bank-accounts/${accountId}`);
  },

  // Set a bank account as default payout destination
  setDefaultBankAccount: async (accountId) => {
    return await axiosClient.put(`/users/bank-accounts/${accountId}/default`);
  },
};
