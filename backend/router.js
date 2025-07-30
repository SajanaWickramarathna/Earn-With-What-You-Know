const express = require("express");
const router = express.Router();


//const customerRoutes = require("./Routes/customerRoutes");
const learnerRoutes = require("./Routes/learnerRoutes"); 
const creatorRoutes = require("./Routes/creatorRoutes");
const userRoutes = require("./Routes/userRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const supporterRoutes = require("./Routes/customerSupporterRoutes");




router.use("/users", userRoutes);
//router.use("/customers", customerRoutes);
router.use("/learners", learnerRoutes); 
router.use("/creators", creatorRoutes);
router.use("/admins", adminRoutes);
router.use("/supporters", supporterRoutes);




module.exports = router;
