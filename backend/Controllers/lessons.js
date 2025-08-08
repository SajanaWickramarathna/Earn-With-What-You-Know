const Lesson = require('../Models/lessons');

// Create a lesson
exports.createLesson = async (req, res) => {
  try {
    const lesson = new Lesson(req.body);
    await lesson.save();
    res.status(201).json(lesson);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all lessons for a course by `course_id`
exports.getLessonsByCourse = async (req, res) => {
  try {
    const course_id = req.params.courseId;
    const lessons = await Lesson.find().populate({
      path: 'course',
      match: { course_id }
    }).sort('order');

    const filtered = lessons.filter(lesson => lesson.course); // Only those matching course
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get lesson by `lesson_id`
exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findOne({ lesson_id: req.params.id });
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update lesson by `lesson_id`
exports.updateLesson = async (req, res) => {
  try {
    const updated = await Lesson.findOneAndUpdate({ lesson_id: req.params.id }, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Lesson not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete lesson by `lesson_id`
exports.deleteLesson = async (req, res) => {
  try {
    const deleted = await Lesson.findOneAndDelete({ lesson_id: req.params.id });
    if (!deleted) return res.status(404).json({ message: 'Lesson not found' });
    res.json({ message: 'Lesson deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
