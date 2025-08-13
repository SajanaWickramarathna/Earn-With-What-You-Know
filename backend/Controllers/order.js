const Order = require('../Models/order');
const Course = require('../Models/courses');
const Earning = require('../Models/earning');

// Create new order (called when learner purchases a course)
exports.createOrder = async (req, res) => {
    try {
        const { courseId, learnerId, totalPrice } = req.body;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const order = new Order({
            course: course._id,
            creator: course.creator,
            learner: learnerId,
            totalPrice,
            status: 'completed' // assume immediate completion for analytics
        });

        await order.save();

        // Update course purchase count
        course.purchase_count += 1;
        await course.save();

        // Update creator earnings
        const EarningModel = require('../Models/earning');
        const description = `Course Sale: ${course.title}`;
        const creatorId = course.creator;
        const amount = totalPrice; // optionally, subtract platform fee
        // Use addCredit function from earnings controller
        const { addCredit } = require('../Controllers/createEarning');
        await addCredit(creatorId, amount, description);

        res.status(201).json({ message: 'Order created successfully', order });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all orders for a creator (for analytics or order history)
exports.getCreatorOrders = async (req, res) => {
    try {
        const creatorId = req.user._id;
        const orders = await Order.find({ creator: creatorId })
            .populate('course', 'title')
            .populate('learner', 'firstName lastName email')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
