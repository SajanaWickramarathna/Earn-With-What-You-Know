const Course = require('../Models/courses');
const Lesson = require('../Models/lessons');
const User = require('../Models/user');

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    const creatorUser = await User.findOne({ user_id: req.user.id });
    if (!creatorUser) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    const course = new Course({
      ...req.body,
      creator_id: creatorUser.user_id,
    });

    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all approved courses with lessons
// Get all approved courses with filters
exports.getAllCourses = async (req, res) => {
  try {
    const { category, language, minPrice, maxPrice, minLessons, maxLessons } = req.query;

    // Base filter: only approved courses
    let filter = { status: 'approved' };

    if (category) filter.category = category;
    if (language) filter.language = language;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let courses = await Course.find(filter);

    // Fetch lessons per course
    const coursesWithLessons = await Promise.all(
      courses.map(async (course) => {
        const lessons = await Lesson.find({ course_id: course.course_id }).sort({ order: 1 });

        // Lesson count filter
        if ((minLessons && lessons.length < Number(minLessons)) ||
            (maxLessons && lessons.length > Number(maxLessons))) {
          return null; // exclude this course
        }

        return { ...course.toObject(), lessons };
      })
    );

    res.json(coursesWithLessons.filter(c => c !== null));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get course by course_id including lessons
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findOne({ course_id: req.params.id });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const lessons = await Lesson.find({ course_id: course.course_id }).sort({ order: 1 });

    res.json({ ...course.toObject(), lessons });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all courses for the logged-in creator
exports.getMyCourses = async (req, res) => {
  try {
    const myCourses = await Course.find({ creator_id: req.user.id });

    const coursesWithLessons = await Promise.all(
      myCourses.map(async (course) => {
        const lessons = await Lesson.find({ course_id: course.course_id }).sort({ order: 1 });
        return { ...course.toObject(), lessons };
      })
    );

    res.json(coursesWithLessons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update course by course_id
exports.updateCourse = async (req, res) => {
  try {
    const updated = await Course.findOneAndUpdate(
      { course_id: req.params.id, creator_id: req.user.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Course not found or not authorized' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete course by course_id
exports.deleteCourse = async (req, res) => {
  try {
    const deleted = await Course.findOneAndDelete({ course_id: req.params.id, creator_id: req.user.id });
    if (!deleted) return res.status(404).json({ message: 'Course not found or not authorized' });

    await Lesson.deleteMany({ course_id: deleted.course_id }); // Remove lessons by numeric course_id
    res.json({ message: 'Course and its lessons deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve/reject course by course_id (admin only)
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

// Controller
exports.getPendingCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: "pending" });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.getCoursesByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status;
    }

    const courses = await Course.find(filter).sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



