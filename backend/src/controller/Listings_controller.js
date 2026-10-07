import {createListingService} from "../services/Listings_services.js";

 export const createListingController = async(req,res) =>{
    try {
        const sellerid= req.user.id;
        const newListing = await createListingService(sellerid,req.body);

        return res.status(201).json({
            success: true,
            message: 'Successfully registered to consign / sell luxury products!',
            data: newListing
        })
    } catch (error) {
        return res.status(error.status||500).json({
            success: false,
            message: error.message || 'Server error when posting.'
        })
    }

}