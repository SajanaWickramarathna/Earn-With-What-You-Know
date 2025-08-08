const express = require('express');
const router = express.Router();
const courseController = require('../Controllers/courses');

// Public
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

// Creator
router.post('/', courseController.createCourse);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

// Admin
router.patch('/:id/status', courseController.setCourseStatus);

module.exports = router;
