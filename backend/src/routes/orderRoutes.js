import express from 'express'
import * as orderController from '../controller/orderController.js'
import { verifyToken, verifyRole } from '../middlewares/authMiddleware.js'
import { cancelItemslimiter } from '../middlewares/rateLimiter.js'

const router = express.Router();

router.post('/', verifyToken, verifyRole(["user"]), orderController.createOrderController);
router.get('/', verifyToken, orderController.getOrdersController);
router.get('/seller/incoming', verifyToken, orderController.getSellerIncomingOrdersController);
router.get('/payment/simulate-checkout',orderController.simulatePaymentSuccessController);
router.put('/:id/cancel', verifyToken,cancelItemslimiter,orderController.cancelOrderController);

// Confirm order delivery receipt by buyer
router.put('/:id/confirm-receipt', verifyToken, orderController.confirmReceiptController);

// Admin escrow payouts endpoints
router.get('/admin/escrow', verifyToken, verifyRole(["admin"]), orderController.getAdminEscrowPayoutsController);
router.post('/admin/escrow/:id/disburse', verifyToken, verifyRole(["admin"]), orderController.disburseEscrowPayoutController);

export default router;
