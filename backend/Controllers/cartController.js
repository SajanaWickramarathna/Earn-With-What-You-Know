const Cart = require('../Models/CartModel');
const Course = require('../Models/courses');

// Get cart for logged-in user
exports.getMyCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user_id: req.user.id });
    if (!cart) cart = { courses: [] }; // empty cart
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add course to cart
exports.addToCart = async (req, res) => {
  try {
    const { course_id } = req.body;
    const course = await Course.findOne({ course_id, status: 'approved' });
    if (!course) return res.status(404).json({ error: 'Course not found or not approved' });

    let cart = await Cart.findOne({ user_id: req.user.id });
    if (!cart) {
      cart = new Cart({ user_id: req.user.id, courses: [] });
    }

    // Check if course already in cart
    const existing = cart.courses.find(c => c.course_id === course_id);
    if (existing) {
      existing.quantity += 1; // optional, usually 1 for courses
    } else {
      cart.courses.push({
        course_id: course.course_id,
        title: course.title,
        price: course.price,
        quantity: 1
      });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove course from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { course_id } = req.body;
    const cart = await Cart.findOne({ user_id: req.user.id });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.courses = cart.courses.filter(c => c.course_id !== course_id);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.user.id });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.courses = [];
    await cart.save();
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
