const express = require('express');
const router = express.Router();

const userController = require('../Controllers/user');
const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

router.get('/', userController.getUsers);

router.get("/user", userController.getUserById);

// ❌ Removed login route
// router.post('/signin', userController.login);

// ✅ New signup route
router.post('/adduser', upload.single('profile_image'), userController.addUser);

router.put("/updateuser", upload.single('profile_image'), userController.updateUser);
router.delete("/deleteuser", userController.deleteUser);

// Example dashboards for role-based access
router.get('/admin-dashboard', authMiddleware(['admin']), (req, res) => {
    res.json({ message: 'Welcome to Admin Dashboard' });
});

router.get('/customer-dashboard', authMiddleware(['customer']), (req, res) => {
    res.json({ message: 'Welcome to Customer Dashboard' });
});

router.get('/support-dashboard', authMiddleware(['customer_supporter']), (req, res) => {
    res.json({ message: 'Welcome to Customer Support Dashboard' });
});

module.exports = router;
