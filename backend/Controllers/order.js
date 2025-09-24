const Order = require("../Models/order");
const Cart = require("../Models/CartModel");
const User = require("../Models/user");

// Create order (learner)
exports.createOrder = async (req, res) => {
  try {
    const user_id = req.user_id; // from JWT
    const { payment_method } = req.body;

    const cart = await Cart.findOne({ user_id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const user = await User.findOne({ user_id });
    if (!user) return res.status(404).json({ message: "User not found" });

    const order = new Order({
      user_id,
      items: cart.items.map(item => ({
        course_id: item.course_id,
        price: item.price,
        quantity: item.quantity,
        title: `Course ${item.course_id}`
      })),
      total_price: cart.total_price,
      payment_method
    });

    await order.save();
    await Cart.findOneAndDelete({ user_id }); // clear cart after order

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user_id").sort({ created_at: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user orders (learner)
exports.getMyOrders = async (req, res) => {
  try {
    const user_id = req.user_id;
    const orders = await Order.find({ user_id }).sort({ created_at: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Order.findOneAndUpdate(
      { order_id: req.params.id },
      { status, updated_at: Date.now() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Order not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
