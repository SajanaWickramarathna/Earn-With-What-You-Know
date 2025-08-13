const express = require('express');
const router = express.Router();
const { createOrder, getCreatorOrders } = require('../Controllers/order');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// POST /orders → create a new order
router.post('/', createOrder);

// GET /orders/creator → get all orders for creator
router.get('/creator', getCreatorOrders);

module.exports = router;
