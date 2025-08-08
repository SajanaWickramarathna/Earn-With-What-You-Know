const express = require('express');
const router = express.Router();
const lessonController = require('../Controllers/lessons');

// Lesson CRUD
router.post('/', lessonController.createLesson);
router.get('/course/:courseId', lessonController.getLessonsByCourse);
router.get('/:id', lessonController.getLessonById);
router.put('/:id', lessonController.updateLesson);
router.delete('/:id', lessonController.deleteLesson);

module.exports = router;
