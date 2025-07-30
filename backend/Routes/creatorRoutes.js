// Routes/creatorRoutes.js
const express = require('express');
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require('../middleware/authMiddleware'); // Assuming you'll use this for creator-specific protected routes
const creatorController = require('../Controllers/creator');

router.get('/', creatorController.getCreators);
router.get('/user', creatorController.getCreatorById);
router.post('/signup', upload.single("profile_image"), creatorController.addCreator);
router.put('/update', upload.single("profile_image"), creatorController.updateCreator);
router.put('/updatepassword', creatorController.updateCreatorPassword);
router.get('/name', creatorController.getCreatorNameById); // Adjusted route for clarity if needed
router.delete('/delete', creatorController.deleteCreator);

module.exports = router;