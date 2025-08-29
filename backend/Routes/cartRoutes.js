const express = require('express');
const router = express.Router();
const cartController = require('../Controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require logged-in user (learner)
router.get('/', authMiddleware(['learner']), cartController.getMyCart);
router.post('/add', authMiddleware(['learner']), cartController.addToCart);
router.post('/remove', authMiddleware(['learner']), cartController.removeFromCart);
router.post('/clear', authMiddleware(['learner']), cartController.clearCart);

module.exports = router;
