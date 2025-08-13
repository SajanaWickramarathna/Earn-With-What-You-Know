const Course = require('../Models/courses');
const Earning = require('../Models/earning');
const Order = require('../Models/Order'); 
const mongoose = require('mongoose');

exports.getCreatorAnalytics = async (req, res) => {
    try {
        const creatorId = req.user._id;

        // 1️⃣ Total courses
        const totalCourses = await Course.countDocuments({ creator: creatorId });

        // 2️⃣ Course status breakdown
        const statusAggregation = await Course.aggregate([
            { $match: { creator: mongoose.Types.ObjectId(creatorId) } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        const courseStatus = {};
        statusAggregation.forEach(item => { courseStatus[item._id] = item.count });

        // 3️⃣ Total sales & revenue
        const salesAggregation = await Order.aggregate([
            { $match: { creator: mongoose.Types.ObjectId(creatorId), status: 'completed' } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" }, totalOrders: { $sum: 1 } } }
        ]);
        const totalRevenue = salesAggregation[0]?.totalRevenue || 0;
        const totalOrders = salesAggregation[0]?.totalOrders || 0;

        // 4️⃣ Top-selling courses
        const topCourses = await Course.find({ creator: creatorId })
            .sort({ purchase_count: -1 })
            .limit(5)
            .select('title purchase_count average_rating');

        // 5️⃣ Earnings summary
        const earnings = await Earning.findOne({ creator: creatorId });

        // 6️⃣ Revenue trends (monthly for last 12 months)
        const now = new Date();
        const pastYear = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);

        const revenueTrends = await Order.aggregate([
            { $match: { 
                creator: mongoose.Types.ObjectId(creatorId), 
                status: 'completed', 
                createdAt: { $gte: pastYear } 
            }},
            { $group: {
                _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                revenue: { $sum: "$totalPrice" },
                orders: { $sum: 1 }
            }},
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        res.json({
            totalCourses,
            courseStatus,
            totalRevenue,
            totalOrders,
            topCourses,
            earnings,
            revenueTrends
        });

    } catch (err) {
        console.error("Analytics Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
