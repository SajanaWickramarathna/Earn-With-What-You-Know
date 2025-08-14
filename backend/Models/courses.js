// models/Course.js
const mongoose = require('mongoose');
const Counter = require('./counter'); // Import counter

const courseSchema = new mongoose.Schema({
  course_id: { type: Number, unique: true },
  title: { type: String, required: true },
  description: String,
  category: String,
  price: { type: Number, default: 0 },
  language: { type: String, enum: ['Sinhala', 'Tamil', 'English'], required: true },

 
  creator_id: { type: Number, required: true }, // numeric ID for quick filtering

  teaser_url: String,
  thumbnail_url: String,
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  resources: [String],

  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  purchase_count: { type: Number, default: 0 },
  average_rating: { type: Number, default: 0 },
  review_count: { type: Number, default: 0 },
  creator_earnings: { type: Number, default: 0 },
}, { timestamps: true });

// Auto-increment `course_id`
courseSchema.pre('save', async function (next) {
  if (!this.isNew) return next();

  try {
    const counter = await Counter.findOneAndUpdate(
      { name: 'course_id' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    this.course_id = counter.value;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Course', courseSchema);
