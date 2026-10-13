import express from 'express'
import * as userRole from '../controller/User_controller.js'

const router= express.Router();

router.post('/register',userRole.registerController);
router.post('/login',userRole.loginController);

export default router;