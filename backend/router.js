const express = require("express");
const router = express.Router();



const learnerRoutes = require("./Routes/learnerRoutes"); 
const creatorRoutes = require("./Routes/creatorRoutes");
const userRoutes = require("./Routes/userRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const supporterRoutes = require("./Routes/customerSupporterRoutes");
const courseRoutes = require("./Routes/coursesRoutes");
const lessonRoutes = require("./Routes/lessonRouts");
const creatorEarningsRoutes = require("./Routes/creatorEarningsRoutes");
const creatorAnalyticsRoutes = require("./Routes/creatorAnalyticsRoutes");
const orders = require("./Routes/orderRoutes");

router.use("/users", userRoutes);
router.use("/learners", learnerRoutes); 
router.use("/creators", creatorRoutes);
router.use("/admins", adminRoutes);
router.use("/supporters", supporterRoutes);
router.use("/courses", courseRoutes);
router.use("/lessons", lessonRoutes);
router.use("/creator/earnings", creatorEarningsRoutes); // Creator earnings routes
router.use("/creator/analytics", creatorAnalyticsRoutes); // Creator analytics routes
router.use("/orders", orders); // Order routes


module.exports = router;
