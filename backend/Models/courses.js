// models/Course.js
const mongoose = require('mongoose');
const Counter = require('./counter'); // Import counter

const courseSchema = new mongoose.Schema({
  course_id: { type: Number, unique: true },
  title: { type: String, required: true },
  description: String,
  price: { type: Number, default: 0 },
  language: { type: String, enum: ['Sinhala', 'Tamil', 'English'], required: true },
  category: { 
    type: String, 
    enum: [
      'Cooking & Food Skills', 
      'Music & Instruments', 
      'Handicrafts & Creative Skills', 
      'Languages & Communication', 
      'Technology & Digital Skills', 
      'Repair & Technical Skills', 
      'Health & Fitness', 
      'Entrepreneurship & Business'
    ],
    required: true 
  },

  creator_id: { type: Number, required: true }, // numeric ID for quick filtering

  teaser_url: String,
  thumbnail_url: String,
  lessons: [
    {
      lesson_id: Number,
      title: String,
      video_url: String,
      duration: Number,
      price: Number,
      order: Number,
      is_preview: { type: Boolean, default: false }
    }
  ],
  resources: [String],

  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejection_reason: { type: String, default: "" }, // <-- New field for rejection reason

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
