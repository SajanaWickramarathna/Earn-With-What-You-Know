const Lesson = require('../Models/lessons');

// Create a lesson under a course
exports.createLesson = async (req, res) => {
  try {
    const { course_id, title, video_url, duration, price, order, is_preview } = req.body;

    const lesson = new Lesson({
      course_id,
      title,
      video_url,
      duration,
      price,
      order,
      is_preview,
    });

    await lesson.save();
    res.status(201).json(lesson);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all lessons for a course
exports.getLessonsByCourse = async (req, res) => {
  try {
    const course_id = parseInt(req.params.courseId, 10);
    const lessons = await Lesson.find({ course_id }).sort({ order: 1 });
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get lesson by lesson_id
exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findOne({ lesson_id: req.params.id });
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update lesson
exports.updateLesson = async (req, res) => {
  try {
    const updated = await Lesson.findOneAndUpdate(
      { lesson_id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Lesson not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete lesson
exports.deleteLesson = async (req, res) => {
  try {
    const deleted = await Lesson.findOneAndDelete({ lesson_id: req.params.id });
    if (!deleted) return res.status(404).json({ message: 'Lesson not found' });
    res.json({ message: 'Lesson deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
