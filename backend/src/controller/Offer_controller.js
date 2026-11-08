import * as OfferServices from '../services/Offer_services.js';

export const createOfferController = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { listing_id, offered_price, buyer_note } = req.body;

    const offer = await OfferServices.createOfferService({
      buyerId,
      listingId: listing_id,
      offeredPrice: offered_price,
      buyerNote: buyer_note,
    });

    return res.status(201).json({
      success: true,
      message: 'Gửi đề xuất giá thành công!',
      data: offer,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Lỗi xử lý gửi đề xuất giá.',
    });
  }
};

export const getReceivedOffersController = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const offers = await OfferServices.getReceivedOffersService(sellerId);
    return res.status(200).json({
      success: true,
      data: offers,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Lỗi lấy danh sách đề xuất giá.',
    });
  }
};

export const getSentOffersController = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const offers = await OfferServices.getSentOffersService(buyerId);
    return res.status(200).json({
      success: true,
      data: offers,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Lỗi lấy danh sách đề xuất đã gửi.',
    });
  }
};

export const respondOfferController = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { id } = req.params;
    const { action } = req.body;

    const updated = await OfferServices.respondOfferService({
      offerId: id,
      sellerId,
      action,
    });

    return res.status(200).json({
      success: true,
      message: action === 'accepted' ? 'Đã đồng ý đề xuất giá!' : 'Đã từ chối đề xuất giá.',
      data: updated,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Lỗi phản hồi đề xuất giá.',
    });
  }
};
