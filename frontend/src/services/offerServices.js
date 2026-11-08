import axiosClient from './axiosClient';

export const offerServices = {
  // Gửi đề xuất giá mới (Buyer)
  createOffer: (data) => {
    return axiosClient.post('/offers', data);
  },

  // Lấy các đề xuất khách gửi cho người bán (Seller)
  getReceivedOffers: () => {
    return axiosClient.get('/offers/received');
  },

  // Lấy các đề xuất người mua đã gửi (Buyer)
  getSentOffers: () => {
    return axiosClient.get('/offers/sent');
  },

  // Phản hồi đề xuất (Seller: 'accepted' | 'rejected')
  respondOffer: (offerId, action) => {
    return axiosClient.patch(`/offers/${offerId}/respond`, { action });
  },
};
