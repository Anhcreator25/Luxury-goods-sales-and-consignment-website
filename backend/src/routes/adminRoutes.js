import express from 'express';
import * as adminController from '../controller/Admin_controller.js';
import { verifyToken, verifyRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All admin endpoints require a valid token and the 'admin' role
router.use(verifyToken, verifyRole(['admin']));

// 1. Overview KPI statistics for Admin Dashboard
router.get('/stats', adminController.getAdminStatsController);

// 2. Revenue analytics data for chart visualization
router.get('/revenue-analytics', adminController.getRevenueAnalyticsController);

// 3. Paginated order management with search and status filtering
router.get('/orders', adminController.getAdminOrdersController);

// 4. Platform user management with activity metrics
router.get('/users', adminController.getAdminUsersController);

export default router;
