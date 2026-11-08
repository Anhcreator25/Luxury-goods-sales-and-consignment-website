import express from 'express';
import { verifyToken } from '../middlwares/authmiddlware.js';
import * as offerController from '../controller/Offer_controller.js';

const router = express.Router();

// All offer actions require authentication
router.post('/', verifyToken, offerController.createOfferController);
router.get('/received', verifyToken, offerController.getReceivedOffersController);
router.get('/sent', verifyToken, offerController.getSentOffersController);
router.patch('/:id/respond', verifyToken, offerController.respondOfferController);

export default router;
