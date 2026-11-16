import express from 'express'
import * as orderController from '../controller/orderController.js'
import { verifyToken, verifyRole } from '../middlewares/authMiddleware.js'
import { cancelItemslimiter } from '../middlewares/rateLimiter.js'

const router = express.Router();

router.post('/', verifyToken, verifyRole(["user"]), orderController.createOrderController);
router.get('/', verifyToken, orderController.getOrdersController);
router.get('/payment/simulate-checkout',orderController.simulatePaymentSuccessController);
router.put('/:id/cancel', verifyToken,cancelItemslimiter,orderController.cancelOrderController);

export default router;
