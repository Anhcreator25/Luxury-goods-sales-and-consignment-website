import express from 'express'
import * as userRole from '../controller/User_controller.js'
import {loginLimiter,registerLimiter} from '../middlwares/rateLimiter.js'

const router= express.Router();

router.post('/register',registerLimiter,userRole.registerController);
router.post('/login',loginLimiter,userRole.loginController);

export default router;