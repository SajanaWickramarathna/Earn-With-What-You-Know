const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    type: { type: String, enum: ['credit', 'debit'], required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'completed', 'rejected'], default: 'completed' } // for withdrawals
});

const earningSchema = new Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    total_earned: { type: Number, default: 0 },
    available_balance: { type: Number, default: 0 },
    pending_withdrawals: { type: Number, default: 0 },
    transactions: [transactionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Earning', earningSchema);
