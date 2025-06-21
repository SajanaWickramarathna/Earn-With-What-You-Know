const express = require('express');
const router = express.Router();
const creatorController = require('../Controllers/creator');
const upload = require("../middleware/uploadMiddleware");

// Get all creators
router.get('/', creatorController.getCreators);

// Get creator by user_id (query param: ?id=123)
router.get('/creator', creatorController.getCreatorById);

// Add new creator with profile image upload
router.post('/addcreator', upload.single('profile_image'), creatorController.addCreator);

// Update existing creator
router.put('/updatecreator', upload.single('profile_image'), creatorController.updateCreator);

// Delete creator by user_id (query param: ?id=123)
router.delete('/deletecreator', creatorController.deleteCreator);

module.exports = router;
