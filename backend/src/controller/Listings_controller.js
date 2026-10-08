import {createListingService,getListingServices} from "../services/Listings_services.js";
  
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

export const getListingController = async(req,res) =>{
    try {
        const result = await getListingServices(req.query);
        return res.status(200).json({
            success : true,
            message: 'Get listings successfully',
            data: result.data,
            pagination: result.pagination
        });
        
    } catch (error) {
        console.error('Errror in getListingsController:',error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        })
        
    }


}