const mongoose = require('mongoose');
const Counter = require('./counter');

const cartSchema = new mongoose.Schema({
  cart_id: { type: Number, unique: true },
  user_id: { type: Number, required: true }, // numeric user ID
  courses: [
    {
      course_id: { type: Number, required: true },
      title: String,
      price: Number,
      quantity: { type: Number, default: 1 },
    }
  ],
}, { timestamps: true });

// Auto-increment cart_id
cartSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: 'cart_id' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    this.cart_id = counter.value;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Cart', cartSchema);
