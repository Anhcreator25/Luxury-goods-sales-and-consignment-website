import { createOrderServices } from "../services/Order_services.js";

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