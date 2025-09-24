// controllers/orderController.js
const Order = require("../Models/Order");
const Cart = require("../Models/CartModel");
const Course = require("../Models/courses");

exports.createOrder = async (req, res) => {
  const { shipping_address, payment_method } = req.body;
  const user_id = req.user_id;

  try {
    const cart = await Cart.findOne({ user_id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const orderItems = await Promise.all(cart.items.map(async (item) => {
      const course = await Course.findOne({ course_id: item.course_id });
      if (!course) throw new Error(`Course ${item.course_id} not found`);
      return { course_id: course.course_id, quantity: 1, price: course.price };
    }));

    const total_price = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newOrder = new Order({
      user_id,
      items: orderItems,
      total_price,
      shipping_address,
      payment_method,
      payment_status: payment_method === "COD" ? "pending" : "pending"
    });

    await newOrder.save();

    // Clear user's cart
    await Cart.findOneAndDelete({ user_id });

    res.status(201).json({ message: "Order placed", order: newOrder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all orders for user
exports.getMyOrders = async (req, res) => {
  const user_id = req.user_id;
  try {
    const orders = await Order.find({ user_id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
