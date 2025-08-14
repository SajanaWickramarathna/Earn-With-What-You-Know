const express = require('express');
const router = express.Router();
const courseController = require('../Controllers/courses');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', courseController.getAllCourses);

// Creator routes (must be logged in as creator)
router.get('/my-courses', authMiddleware(['creator']), courseController.getMyCourses); // keep above /:id
router.get('/:id', courseController.getCourseById); // must come after /my-courses

router.post('/', authMiddleware(['creator']), courseController.createCourse);
router.put('/:id', authMiddleware(['creator']), courseController.updateCourse);
router.delete('/:id', authMiddleware(['creator']), courseController.deleteCourse);

// Admin routes
router.patch('/:id/status', authMiddleware(['admin']), courseController.setCourseStatus);


module.exports = router;
