const express = require('express');
const router = express.Router();
const learnerController = require('../Controllers/learner');
const upload = require("../middleware/uploadMiddleware");

// Get all learners
router.get('/', learnerController.getLearners);

// Get learner by user_id (query param: ?id=123)
router.get('/learner', learnerController.getLearnerById);

// Add new learner with profile image upload
router.post('/addlearner', upload.single('profile_image'), learnerController.addLearner);

// Update existing learner
router.put('/updatelearner', upload.single('profile_image'), learnerController.updateLearner);

// Delete learner by user_id (query param: ?id=123)
router.delete('/deletelearner', learnerController.deleteLearner);

module.exports = router;
