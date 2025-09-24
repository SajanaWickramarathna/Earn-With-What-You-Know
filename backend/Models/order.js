// models/Order.js
const mongoose = require("mongoose");
const Counter = require("./counter");

const orderSchema = new mongoose.Schema({
  order_id: { type: Number, unique: true },
  user_id: { type: String, ref: "user", required: true },
  items: [
    {
      course_id: { type: Number, ref: "course", required: true },
      quantity: { type: Number, default: 1 },
      price: { type: Number, required: true },
    },
  ],
  total_price: { type: Number, required: true },
  shipping_address: { type: String, required: true },
  payment_method: { type: String, enum: ["COD", "Payment Slip"], required: true },
  payment_status: { type: String, enum: ["pending", "paid"], default: "pending" },
  status: { type: String, enum: ["pending", "processing", "completed", "cancelled"], default: "pending" },
  created_at: { type: Date, default: Date.now },
}, { timestamps: true });

// Auto-increment order_id
orderSchema.pre("save", async function(next) {
  if (!this.isNew) return next();
  const counter = await Counter.findOneAndUpdate(
    { name: "order_id" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  this.order_id = counter.value;
  next();
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
module.exports = Order;
