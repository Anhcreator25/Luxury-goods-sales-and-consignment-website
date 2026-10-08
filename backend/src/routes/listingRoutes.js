import express from 'express'
import { createListingController,getListingController} from '../controller/Listings_controller.js'
import { verifyToken } from '../middlwares/authmiddlware.js';
const router = express.Router();
 
router.post('/create_listing',verifyToken, createListingController);
router.get('/get_listing',getListingController);

export default router;