import express from 'express'
import { createListingController,getListingController,getListingByIdController,updateListingController,deleteListingController} from '../controller/Listings_controller.js'
import { verifyToken ,verifyRole } from '../middlwares/authmiddlware.js';
const router = express.Router();
 
router.post('/create_listing',verifyToken, createListingController);
router.get('/get_listing',getListingController);
router.get('/:id',getListingByIdController);
router.put('/:id',verifyToken,verifyRole(["seller","admin"]),updateListingController);
router.delete('/:id',verifyToken,verifyRole(["seller","admin"]),deleteListingController);
export default router;