import express from 'express'
import * as cartController from '../controller/Cart_controller.js'
import {verifyToken,verifyRole} from '../middlwares/authmiddlware.js';
const router = express.Router();
 
router.get('/',verifyToken,cartController.getCartController);
router.post('/',verifyToken,verifyRole["buyer","seller"],cartController.addCartController);
router.delete('/:id',verifyToken,verifyRole["buyer"],cartController.removeCartController);

export default router;