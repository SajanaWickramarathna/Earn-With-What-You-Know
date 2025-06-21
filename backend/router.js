const express = require("express");
const router = express.Router();

const userRoutes = require("./Routes/userRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const creatorRoutes = require("./Routes/creatorRoutes");
const learnerRoutes = require("./Routes/learnerRoutes");
const supporterRoutes = require("./Routes/customerSupporterRoutes");

router.use("/users", userRoutes);
router.use("/admins", adminRoutes);
router.use("/creators", creatorRoutes);
router.use("/learners", learnerRoutes);
router.use("/supporters", supporterRoutes);

module.exports = router;
