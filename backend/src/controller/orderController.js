import { 
    createOrderServices, 
    getOrderByRoleServices, 
    updatePaymentSuccessService, 
    cancelOrderServices,
    confirmOrderReceiptService,
    getAdminEscrowPayoutsService,
    disburseEscrowPayoutService,
    getSellerIncomingOrdersService
} from "../services/Order_services.js";

export const createOrderController = async ( req, res) => {
    try {
        
      const userId = req.user.id;
      const { shipping_address , phone_number , payment_method, cartItemId} = req.body;
        if(!shipping_address || !phone_number || !payment_method){
            return res.status(400).json({
                   success: false,
                   message: " please provide shipping_address, phone number, and payment method ."
            })
        }


        if (!cartItemId || !Array.isArray(cartItemId) || cartItemId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please select at least one item from your cart to checkout."
            });
        }
     const result = await createOrderServices(userId,req.body,cartItemId);
                return res.status(201).json({
                success: true,
                data: result
        });

    } catch (error) {
        return res.status(error.status || 500).json({
               success : false,
               message : error.message || "Internal server error while creating order"  });
        
    }
}
export const getOrdersController = async (req, res) => {
    try {
        
        const user = req.user; 

        const orders = await getOrderByRoleServices(user);

        return res.status(200).json({
            success: true,
            count: orders.length,
            message: "Get orders history successfully",
            data: orders
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error while fetching orders"
        });
    }
};

// Retrieve incoming orders for seller
export const getSellerIncomingOrdersController = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const orders = await getSellerIncomingOrdersService(sellerId);
        return res.status(200).json({
            success: true,
            count: orders.length,
            message: "Get seller incoming orders successfully",
            data: orders
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Lỗi khi lấy danh sách đơn từ khách mua"
        });
    }
};
export const simulatePaymentSuccessController = async (req, res, next) => {
    try {
        const { orderId } = req.query; // get orderId in URL 
        
        if (!orderId) {
            return res.status(400).json({ success: false, message: "Missing orderId" });
        }

        
        const result = await updatePaymentSuccessService(orderId);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const cancelOrderController = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        if (!orderId) {
            return res.status(400).json({ success: false, message: "Thiếu mã đơn hàng cần hủy." });
        }

        const result = await cancelOrderServices(orderId, userId, userRole);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Lỗi máy chủ khi hủy đơn hàng"
        });
    }
};

// Confirm delivery receipt and mark order as completed
export const confirmReceiptController = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;

        if (!orderId) {
            return res.status(400).json({ success: false, message: "Thiếu mã đơn hàng." });
        }

        const result = await confirmOrderReceiptService(orderId, userId);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Lỗi máy chủ khi xác nhận nhận hàng"
        });
    }
};

// Retrieve all escrow payouts for admin dashboard
export const getAdminEscrowPayoutsController = async (req, res) => {
    try {
        const payouts = await getAdminEscrowPayoutsService();
        return res.status(200).json({
            success: true,
            data: payouts
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Lỗi khi lấy danh sách ký quỹ"
        });
    }
};

// Disburse escrow payout by admin
export const disburseEscrowPayoutController = async (req, res) => {
    try {
        const payoutId = req.params.id;
        const adminId = req.user.id;

        const result = await disburseEscrowPayoutService(payoutId, adminId, req.body);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Lỗi khi thực hiện giải ngân"
        });
    }
};
