import axiosClient from "./axiosClient";

export const listingServices = {
  getListings: async (params = {}) => {
    return await axiosClient.get("/listings/get_listing", { params });
  },
  getListingById: async (id) => {
    return await axiosClient.get(`/listings/get_listing/${id}`);
  }
};

