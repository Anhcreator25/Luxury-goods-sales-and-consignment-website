import express from 'express'
import * as userRole from '../controller/User_controller.js'
import { loginLimiter, registerLimiter } from '../middlewares/rateLimiter.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const router = express.Router();

router.post('/register', registerLimiter, userRole.registerController);
router.post('/login', loginLimiter, userRole.loginController);

// User bank account management routes
router.get('/bank-accounts', verifyToken, userRole.getBankAccountsController);
router.post('/bank-accounts', verifyToken, userRole.addBankAccountController);
router.delete('/bank-accounts/:id', verifyToken, userRole.deleteBankAccountController);
router.put('/bank-accounts/:id/default', verifyToken, userRole.setDefaultBankAccountController);

export default router;