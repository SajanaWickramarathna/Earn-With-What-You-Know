const express = require('express');
const router = express.Router();
const { getEarnings, requestWithdrawal } = require('../Controllers/creatoEarning');
const authMiddleware = require('../middleware/authMiddleware'); // ensure logged-in creator

router.use(authMiddleware);

// GET /creator/earnings
router.get('/', getEarnings);

// POST /creator/earnings/withdraw
router.post('/withdraw', requestWithdrawal);

module.exports = router;
