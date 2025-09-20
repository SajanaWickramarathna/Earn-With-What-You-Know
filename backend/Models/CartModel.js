const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseCartSchema = new Schema({
  user_id: { type: Number, ref: 'user', required: true },
  items: [
    {
      course_id: { type: Number, ref: 'Course', required: true },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
  total_price: { type: Number, required: true, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

courseCartSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('CourseCart', courseCartSchema);