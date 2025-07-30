// Routes/learnerRoutes.js
const express = require('express');
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require('../middleware/authMiddleware'); // Assuming you'll use this for learner-specific protected routes
const learnerController = require('../Controllers/learner');

router.get('/', learnerController.getLearners);
router.get('/user', learnerController.getLearnerById);
router.post('/signup', upload.single("profile_image"), learnerController.addLearner);
router.put('/update', upload.single("profile_image"), learnerController.updateLearner);
router.put('/updatepassword', learnerController.updateLearnerPassword);
router.get('/name', learnerController.getLearnerNameById); // Adjusted route for clarity if needed
router.delete('/delete', learnerController.deleteLearner);

module.exports = router;