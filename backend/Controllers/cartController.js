// Controllers/cartController.js
const CourseCart = require('../Models/CartModel');
const Course = require('../Models/courses');

// Helper function to recalculate the cart's total price efficiently
const recalculateCartTotal = async (cartItems) => {
    const courseIds = cartItems.map(item => item.course_id);
    const courses = await Course.find({ course_id: { $in: courseIds } });

    let total = 0;
    for (const item of cartItems) {
        const course = courses.find(c => c.course_id === item.course_id);
        if (course) {
            total += course.price * item.quantity;
        }
    }
    return total;
};

// ======= Add course to cart =======
exports.addToCart = async (req, res) => {
    try {
        const course_id = Number(req.body.course_id);
        const quantity = Number(req.body.quantity);
        const user_id = Number(req.user.id);

        if (!course_id || !quantity || quantity < 1) {
            return res.status(400).json({ message: "Course ID and a valid quantity required" });
        }

        const course = await Course.findOne({ course_id });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        let cart = await CourseCart.findOne({ user_id });
        if (!cart) {
            cart = new CourseCart({ user_id, items: [] });
        }

        const existingItem = cart.items.find(item => item.course_id === course_id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ course_id, quantity });
        }

        cart.total_price = await recalculateCartTotal(cart.items);
        await cart.save();
        res.status(200).json(cart);
    } catch (err) {
        console.error("Add to cart error:", err);
        res.status(500).json({ message: "Server error: " + err.message });
    }
};

// ======= Get cart by user ID =======
exports.getCart = async (req, res) => {
    try {
        const user_id = Number(req.params.user_id);
        let cart = await CourseCart.findOne({ user_id });
        if (!cart) {
            cart = new CourseCart({ user_id, items: [], total_price: 0 });
            await cart.save();
        }
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: "Server error: " + error.message });
    }
};

// ======= Update quantity of a cart item =======
exports.updateCartItem = async (req, res) => {
    try {
        const { user_id, course_id, quantity } = req.body;
        const cart = await CourseCart.findOne({ user_id: Number(user_id) });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = cart.items.find(i => i.course_id === Number(course_id));
        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }
        
        if (quantity < 1) {
             return res.status(400).json({ message: "Quantity must be at least 1" });
        }

        item.quantity = quantity;

        cart.total_price = await recalculateCartTotal(cart.items);
        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        console.error("Update cart item error:", error);
        res.status(500).json({ message: "Server error: " + error.message });
    }
};

// ======= Remove course from cart =======
exports.removeFromCart = async (req, res) => {
    try {
        const { user_id, course_id } = req.body;
        const cart = await CourseCart.findOne({ user_id: Number(user_id) });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item.course_id !== Number(course_id));
        
        cart.total_price = await recalculateCartTotal(cart.items);
        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        console.error("Remove from cart error:", error);
        res.status(500).json({ message: "Server error: " + error.message });
    }
};

// ======= Clear cart =======
exports.clearCart = async (req, res) => {
    try {
        const user_id = Number(req.params.id);
        const result = await CourseCart.findOneAndDelete({ user_id });
        if (!result) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        res.status(200).json({ message: 'Cart cleared successfully' });
    } catch (error) {
        console.error("Clear cart error:", error);
        res.status(500).json({ message: "Server error: " + error.message });
    }
};

// ======= Get cart item count =======
exports.getCartCount = async (req, res) => {
    try {
        const user_id = Number(req.user.id);
        const cart = await CourseCart.findOne({ user_id });
        if (!cart) {
            return res.status(200).json({ count: 0 });
        }
        const count = cart.items.reduce((acc, i) => acc + i.quantity, 0);
        res.status(200).json({ count });
    } catch (error) {
        console.error("Get cart count error:", error);
        res.status(500).json({ message: "Server error: " + error.message });
    }
};