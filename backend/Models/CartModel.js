const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  user_id: { type: String, ref: "user", required: true },
  items: [
    {
      course_id: { type: Number, ref: "course", required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true }, 
    },
  ],
  total_price: { type: Number, required: true, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

cartSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model("cart", cartSchema);
