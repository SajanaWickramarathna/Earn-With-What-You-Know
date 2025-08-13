const express = require('express');
const router = express.Router();
const courseController = require('../Controllers/courses');
const authMiddleware = require('../middleware/authMiddleware');

// Public
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

// Creator
router.post('/', authMiddleware(['creator']), courseController.createCourse);
router.put('/:id', authMiddleware(['creator']), courseController.updateCourse);
router.delete('/:id', authMiddleware(['creator']), courseController.deleteCourse);

// Admin
router.patch('/:id/status', courseController.setCourseStatus);

module.exports = router;
