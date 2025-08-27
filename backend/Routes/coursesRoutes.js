const express = require('express');
const router = express.Router();
const courseController = require('../Controllers/courses');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require("../middleware/uploadMiddleware");
const Course = require('../Models/courses');

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
router.get("/admin/pending", authMiddleware(["admin"]), courseController.getPendingCourses);

// Get all, pending, approved, rejected for admin
router.get('/admin/all',courseController.getCoursesByStatus);

// Upload thumbnail
router.post(
  "/upload-thumbnail/:id",
  authMiddleware(["creator"]),
  upload.single("thumbnail"),
  async (req, res) => {
    try {
      const course = await Course.findOne({ course_id: req.params.id });
      if (!course) return res.status(404).json({ message: "Course not found" });

      course.thumbnail_url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      await course.save();

      res.json({ message: "Thumbnail uploaded", thumbnail_url: course.thumbnail_url });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Upload teaser
router.post(
  "/upload-teaser/:id",
  authMiddleware(["creator"]),
  upload.single("teaser"),
  async (req, res) => {
    try {
      const course = await Course.findOne({ course_id: req.params.id });
      if (!course) return res.status(404).json({ message: "Course not found" });

      course.teaser_url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      await course.save();

      res.json({ message: "Teaser uploaded", teaser_url: course.teaser_url });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;