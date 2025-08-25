// models/Lesson.js
const mongoose = require('mongoose');
const Counter = require('./counter');

const lessonSchema = new mongoose.Schema({
  lesson_id: { type: Number, unique: true },
  course_id: { type: Number, required: true }, // link to course by numeric ID
  title: { type: String, required: true },
  video_url: { type: String, required: true },
  duration: Number,
  price: Number,
  order: Number,
  is_preview: { type: Boolean, default: false },
}, { timestamps: true });

// Auto-increment lesson_id
lessonSchema.pre('save', async function(next) {
  if (!this.isNew) return next();
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: 'lesson_id' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    this.lesson_id = counter.value;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Lesson', lessonSchema);
