import express from 'express'
import * as orderController from '../controller/orderController.js'
import { verifyToken,verifyRole } from '../middlwares/authmiddlware.js'

const router = express.Router();

router.post('/',verifyToken,verifyRole(["user"]),orderController.createOrderController);
router.get('/',verifyToken,orderController.getOrdersController);

export default router;