import express from 'express';
import authMiddleware from '../middleware/auth.js';


import {
  handleOrderAndPayment,
  verifyPayment,
  getOrderDetails,
  getMyOrders,
//   adminListOrders,
//   adminUpdateOrderStatus
listOrders,
updateStatus
} from '../controllers/orderController.js';

const orderRouter = express.Router();

// User routes
orderRouter.post('/place', authMiddleware, handleOrderAndPayment);
orderRouter.get('/verify', verifyPayment);
orderRouter.get('/order-details', authMiddleware, getOrderDetails);
orderRouter.get('/my', authMiddleware, getMyOrders);


// Admin routes
orderRouter.get('/list',listOrders);

orderRouter.post("/status",updateStatus);

export default orderRouter;
