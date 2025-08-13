const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    order_id: { type: Number, unique: true }, // auto-increment
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

// Auto-increment order_id
const Counter = require('./counter');
orderSchema.pre('save', async function (next) {
    if (!this.isNew) return next();
    try {
        const counter = await Counter.findOneAndUpdate(
            { name: 'order_id' },
            { $inc: { value: 1 } },
            { new: true, upsert: true }
        );
        this.order_id = counter.value;
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
