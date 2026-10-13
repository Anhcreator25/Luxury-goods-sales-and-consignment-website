import * as ListingServices from "../services/Listings_services.js";


export const createListingController = async (req, res) => {
    try {
        const sellerid = req.user.id;
        const newListing = await ListingServices.reateListingService(sellerid, req.body);

        return res.status(201).json({
            success: true,
            message: 'Successfully registered to consign / sell luxury products! Waiting for admin approval.',
            data: newListing
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Server error when posting.'
        });
    }
};


export const getListingController = async (req, res) => {
    try {
        const result = await ListingServices.getListingServices(req.query);
        return res.status(200).json({
            success: true,
            message: 'Get listings successfully',
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Error in getListingsController:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};


export const getListingByIdController = async (req, res) => {
    try {
        const id = req.params?.id;
        const listing = await ListingServices.getListingByIdServices(id);

        return res.status(200).json({
            success: true,
            message: 'Get listing details successfully!',
            data: listing
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error?.message || 'Internal Server Error'
        });
    }
};


export const updateListingController = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedListing = await ListingServices.updateListingServices(id, req.body);

        return res.status(200).json({
            success: true,
            message: 'Update listing successfully! Pending for admin re-approval.',
            data: updatedListing
        });
    } catch (error) {
        console.error("Lỗi tại updateListingController:", error);

        return res.status(error?.status || 500).json({
            success: false,
            message: error?.message || 'Internal Server Error'
        });
    }
};


export const updateListingStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 

        if (!status || !['active', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value. Must be 'active', 'rejected', or 'pending'."
            });
        }

        const result = await ListingServices.updateListingStatusService(id, status);

        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error("Lỗi tại updateListingStatusController:", error);

        return res.status(error?.status || 500).json({
            success: false,
            message: error?.message || 'Internal Server Error'
        });
    }
};

export const deleteListingController = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await ListingServices.deletelistingServices(id);

        return res.status(200).json({
            success: true,
            message: 'Deleted listing successfully!',
            data: result
        });
    } catch (error) {
        return res.status(error?.status || 500).json({
            success: false,
            message: error?.message || 'Internal Server Error'
        });
    }
};