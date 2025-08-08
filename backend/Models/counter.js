// models/Counter.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const counterSchema = new Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, required: true, default: 0 }
});

module.exports = mongoose.models.Counter || mongoose.model('Counter', counterSchema);
