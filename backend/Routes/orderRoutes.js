// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../Controllers/order");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware(["learner"]), orderController.createOrder);
router.get("/my-orders", authMiddleware(["learner"]), orderController.getMyOrders);

module.exports = router;
