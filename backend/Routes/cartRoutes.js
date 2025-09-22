const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const CartController = require("../Controllers/cartController");

// All routes now rely on JWT user_id
router.post("/addtocart", authMiddleware(["learner"]), CartController.addToCart);
router.get("/getcart/:user_id", CartController.getCart);
router.put("/updatecartitem", CartController.updateCartItem);
router.delete("/removefromcart", CartController.removeFromCart);
router.delete("/clearcart/:id", CartController.clearCart);
router.get("/count", authMiddleware(["learner"]), CartController.getCartCount);

module.exports = router;
