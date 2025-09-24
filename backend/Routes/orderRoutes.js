const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const orderController = require("../Controllers/order");

// Learner
router.post("/", authMiddleware(["learner"]), orderController.createOrder);
router.get("/my", authMiddleware(["learner"]), orderController.getMyOrders);

// Admin
router.get("/", authMiddleware(["admin"]), orderController.getAllOrders);
router.put("/:id/status", authMiddleware(["admin"]), orderController.updateOrderStatus);

module.exports = router;
