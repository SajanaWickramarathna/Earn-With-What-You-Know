const mongoose = require("mongoose");
const Counter = require("./counter");

const orderSchema = new mongoose.Schema({
  order_id: { type: Number, unique: true },
  user_id: { type: String, ref: "user", required: true },
  items: [
    {
      course_id: { type: Number, ref: "course", required: true },
      price: { type: Number, required: true },
    },
  ],
  total_price: { type: Number, required: true },
  payment_slip: { type: String },
  payment_method: { type: String, enum: ["Payment Slip"], required: true },
  payment_status: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "cancelled"],
    default: "pending",
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Auto-increment order_id
orderSchema.pre("save", async function (next) {
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

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
module.exports = Order;
