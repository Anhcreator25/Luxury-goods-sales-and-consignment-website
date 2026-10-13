import express from 'express'
import * as listingController from '../controller/Listings_controller.js'
import { verifyToken ,verifyRole } from '../middlwares/authmiddlware.js';
const router = express.Router();
 
router.post('/create_listing',verifyToken,verifyRole(["user"]),listingController.createListingController);
router.get('/get_listing',listingController.getListingController);
router.get('/get_listing/:id',listingController.getListingByIdController);
router.put('/update/:id',verifyToken,verifyRole(["user","admin"]),listingController.updateListingController);
router.put('/admin/listing/:id/status', verifyToken, verifyRole(["admin"]),listingController.updateListingStatusController);
router.delete('/delete/:id',verifyToken,verifyRole(["user","admin"]),listingController.deleteListingController);
export default router;