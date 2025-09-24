const express = require('express');
const router = express.Router();
const orderController = require('../Controllers/order');
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// Create a new order (with payment slip upload)
router.post('/create', uploadMiddleware.single('payment_slip'), orderController.createOrder);

// Get orders for a specific user
router.get('/user/:user_id', orderController.getUserOrders);

// Get all orders 
router.get('/all', orderController.getAllOrders);

// Update order status 
router.put('/update/:order_id', orderController.updateOrderStatus);

// Get order details by order ID
router.get('/:order_id', orderController.getOrderById);

module.exports = router;