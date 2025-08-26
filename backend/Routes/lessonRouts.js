const express = require("express");
const router = express.Router();
const lessonController = require("../Controllers/lessons");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Upload lesson video
router.post(
  "/upload-video/:courseId",
  authMiddleware(["creator"]),
  upload.single("video"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No video file uploaded" });

      const video_url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      res.json({ video_url });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Existing lesson routes
router.post("/", authMiddleware(["creator"]), lessonController.createLesson);
router.get("/course/:courseId", lessonController.getLessonsByCourse);
router.get("/:id", lessonController.getLessonById);
router.put("/:id", lessonController.updateLesson);
router.delete("/:id", lessonController.deleteLesson);

module.exports = router;
