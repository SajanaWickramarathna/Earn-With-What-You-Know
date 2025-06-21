const express = require('express');
const router = express.Router();
const supporterController = require('../Controllers/customerSupporter');
const upload = require("../middleware/uploadMiddleware");

// Get all customer supporters
router.get('/', supporterController.getSupporters);

// Get customer supporter by user_id (query param: ?id=123)
router.get('/supporter', supporterController.getSupporterById);

// Add new customer supporter with profile image upload
router.post('/addsupporter', upload.single('profile_image'), supporterController.addSupporter);

// Update existing customer supporter
router.put('/updatesupporter', upload.single('profile_image'), supporterController.updateSupporter);

// Delete customer supporter by user_id (query param: ?id=123)
router.delete('/deletesupporter', supporterController.deleteSupporter);

module.exports = router;
