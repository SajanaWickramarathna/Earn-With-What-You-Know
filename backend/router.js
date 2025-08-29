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
const tickets = require("./Routes/ticketroute");
const notification = require("./Routes/notificationRoutes");
const chat = require("./Routes/chatRoute");
const contact = require("./Routes/contactroute");
const cartRoutes = require("./Routes/cartRoutes");


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
router.use("/tickets", tickets); // Ticket routes
router.use("/notifications", notification); // Notification routes
router.use("/chats", chat); // Chat routes
router.use("/contact", contact); // Contact Us routes
router.use("/cart", cartRoutes); // Cart routes

module.exports = router;
