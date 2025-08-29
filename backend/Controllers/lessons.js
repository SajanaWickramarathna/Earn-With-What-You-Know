const Lesson = require('../Models/lessons');

exports.createLesson = async (req, res) => {
  try {
    const { course_id, title, description, video_url, duration, order, is_preview } = req.body;

    if (!description) {
      return res.status(400).json({ message: "Lesson description is required." });
    }

    // Max lessons per course
    const existingLessonsCount = await Lesson.countDocuments({ course_id });
    if (existingLessonsCount >= 5) {
      return res.status(400).json({ message: "Each course can have a maximum of 5 lessons." });
    }

    // Max lesson duration: 1.5 hours = 5400 seconds
    if (duration > 5400) {
      return res.status(400).json({ message: "Lesson duration cannot exceed 1 hour 30 minutes." });
    }

    const lesson = new Lesson({
      course_id,
      title,
      description,
      video_url,
      duration,
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
    if (req.body.description === "") {
      return res.status(400).json({ message: "Lesson description is required." });
    }

    const updated = await Lesson.findOneAndUpdate(
      { lesson_id: req.params.id },
      {
        title: req.body.title,
        description: req.body.description,
        video_url: req.body.video_url,
        duration: req.body.duration,
        order: req.body.order,
        is_preview: req.body.is_preview
      },
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
