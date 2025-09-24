const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  order_id: { type: Number, unique: true },
  user_id: { type: String, ref: "user", required: true },
  items: [
    {
      course_id: { type: Number, ref: "course", required: true },
      title: String,
      price: Number,
      quantity: { type: Number, default: 1 },
    }
  ],
  total_price: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["pending", "paid", "processing", "completed", "cancelled"], 
    default: "pending" 
  },
  payment_method: { type: String, enum: ["COD", "Card"], default: "COD" },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Auto increment order_id
const Counter = require("./counter");
orderSchema.pre("save", async function(next) {
  if (!this.isNew) return next();
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "order_id" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    this.order_id = counter.value;
    next();
  } catch (err) {
    next(err);
  }
});

orderSchema.pre("save", function(next) {
  this.updated_at = Date.now();
  next();
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
module.exports = Order;
