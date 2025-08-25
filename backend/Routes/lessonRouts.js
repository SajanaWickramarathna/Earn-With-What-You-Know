const express = require('express');
const router = express.Router();
const lessonController = require('../Controllers/lessons');

router.post('/', lessonController.createLesson);           // Create lesson
router.get('/course/:courseId', lessonController.getLessonsByCourse); // All lessons for a course
router.get('/:id', lessonController.getLessonById);       // Single lesson
router.put('/:id', lessonController.updateLesson);        // Update lesson
router.delete('/:id', lessonController.deleteLesson);     // Delete lesson

module.exports = router;
