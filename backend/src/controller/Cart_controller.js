import * as cartServices from '../services/Cart_services.js'

export const getCartController = async ( req,res)=>{

    try {
        const userId = req.user.id;
        const items = await cartServices.getCartServices(userId);
        return res.status(200).json({
            success: true,
            data: items
        })
    } catch (error) {
        return res.status(error.status ||500).json({
            success: false,
            message: error.message || "System error while retrieving the shopping cart"
        })
        
    }
}

export const addCartController = async ( req,res)=>{

    try {
        const userId = req.user.id;
        const {listing_id} = req.body;
  
        if(!listing_id){
            return res.status(400).json({
                success: false,
                message : "Please provide listing_id of product"
            })
        }
        const result = await cartServices.addToCartServices(userId,listing_id);
        return res.status(201).json({
            success: true,
            message: result.message
        })
    } catch (error) {
        return res.status(error.status ||500).json({
            success: false,
            message: error.message || "System error while adding the shopping cart"
        })
        
    }
}

export const removeCartController = async (req,res)=>{
     
    try {
        const userId = req.user.id;
        const {id} = req.params;
        const result = await cartServices.removeCartItemServices(userId,id);
        return res.status(200).json({
            success: true,
            message: result.message
        })

        
    } catch (error) {
        return res.status(error.status ||500).json({
            success: false,
            message: error.message || "System error while removing the shopping cart"
        })
    }
}