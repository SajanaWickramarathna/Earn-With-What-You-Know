const express = require('express');
const router = express.Router();
const { getCreatorAnalytics } = require('../Controllers/creatorAnalytics');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// GET /creator/analytics
router.get('/', getCreatorAnalytics);

module.exports = router;
