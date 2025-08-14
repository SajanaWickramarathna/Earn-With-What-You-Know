// controllers/courseController.js
const Course = require('../Models/courses');
const Lesson = require('../Models/lessons');
const User = require('../Models/user');

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    // Get the logged-in creator's numeric ID
    const creatorUser = await User.findOne({ user_id: req.user.id }); // user_id is numeric
    if (!creatorUser) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    const course = new Course({
      ...req.body,
      creator_id: creatorUser.user_id // store numeric creator_id
    });

    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all approved courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: 'approved' }).populate('lessons');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get course by `course_id`
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findOne({ course_id: req.params.id }).populate('lessons');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all courses for the logged-in creator
exports.getMyCourses = async (req, res) => {
  try {
    const myCourses = await Course.find({ creator_id: req.user.id }).populate('lessons');
    res.json(myCourses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update course by `course_id`
exports.updateCourse = async (req, res) => {
  try {
    const updated = await Course.findOneAndUpdate(
      { course_id: req.params.id, creator_id: req.user.id }, // ensure only owner can update
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Course not found or not authorized' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete course by `course_id`
exports.deleteCourse = async (req, res) => {
  try {
    const deleted = await Course.findOneAndDelete({ course_id: req.params.id, creator_id: req.user.id });
    if (!deleted) return res.status(404).json({ message: 'Course not found or not authorized' });

    await Lesson.deleteMany({ course: deleted._id }); // Remove related lessons
    res.json({ message: 'Course and its lessons deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve/reject course by `course_id` (admin only)
exports.setCourseStatus = async (req, res) => {
  try {
    const { status, rejection_reason } = req.body;
    const course = await Course.findOneAndUpdate(
      { course_id: req.params.id },
      { status, rejection_reason },
      { new: true }
    );
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
