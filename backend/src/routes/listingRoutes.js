import express from 'express'
import { createListingController,getListingController,getListingByIdController} from '../controller/Listings_controller.js'
import { verifyToken } from '../middlwares/authmiddlware.js';
const router = express.Router();
 
router.post('/create_listing',verifyToken, createListingController);
router.get('/get_listing',getListingController);
router.get('/:id',getListingByIdController);
export default router;