import { createOrderServices,getOrderByRoleServices,updatePaymentSuccessService } from "../services/Order_services.js";

export const createOrderController = async ( req, res) => {
    try {
        
      const userId = req.user.id;
      const { shipping_address , phone_number , payment_method, cartItemId} =req.body;
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