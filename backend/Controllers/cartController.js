const Cart = require('../Models/CartModel');
const Course = require('../Models/courses');

//add to cart
exports.addToCart = async (req, res) => {
    const { course_id, quantity } = req.body;
    const user_id = req.user_id; // from JWT

    try {
        const course = await Course.findOne({ course_id });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        let cart = await Cart.findOne({ user_id });
        if (!cart) cart = new Cart({ user_id, items: [] });

        const existingItem = cart.items.find(item => item.course_id === course_id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ course_id, quantity, price: course.price });
        }

        // Update total price
        cart.total_price = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

        await cart.save();
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



//get cart by user id
exports.getCart = async (req, res) => {
    const user_id = req.user_id; // get from JWT
    try {
        let cart = await Cart.findOne({ user_id });
        if (!cart) {
            cart = new Cart({ user_id, items: [], total_price: 0 });
            await cart.save();
        }
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


//update cart item quantity
exports.updateCartItem = async (req, res) => {
    const { user_id, course_id, quantity } = req.body;
    try {
        const cart = await Cart.findOne({ user_id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const item = cart.items.find(item => item.course_id.toString() === course_id.toString());
        if (!item) return res.status(404).json({ message: 'Item not found in cart' });

        item.quantity = quantity;
        await cart.save();
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//update total price
exports.updateTotalPrice = async (req, res) => {
    const { user_id, total_price } = req.body;
    try {
        const cart = await Cart.findOne({ user_id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.total_price = total_price;
        await cart.save();
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//remove from cart
exports.removeFromCart = async (req, res) => {
    const { user_id, course_id } = req.body;
    try {
        const cart = await Cart.findOne({ user_id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.items = cart.items.filter(item => item.course_id.toString() !== course_id.toString());
        await cart.save();
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//clear cart
exports.clearCart = async (req, res) => {
    const user_id = req.user_id; // from JWT
    try {
        await Cart.findOneAndDelete({ user_id });
        res.status(200).json({ message: 'Cart cleared' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



//get cart count (sum of quantities) for a user
exports.getCartCount = async (req, res) => {
    const user_id = req.user_id; // get from JWT
    try {
        const cart = await Cart.findOne({ user_id });
        if (!cart) return res.status(200).json({ count: 0 });

        const count = cart.items.reduce((acc , item) => acc + item.quantity, 0);
        res.status(200).json({ count });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
