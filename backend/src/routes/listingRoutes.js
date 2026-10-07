import express from 'express'
import { createListingController } from '../controller/Listings_controller.js'
import { verifyToken } from '../middlwares/authmiddlware.js';
const router = express.Router();
 
router.post('/create_listing',verifyToken, createListingController)

export default router;