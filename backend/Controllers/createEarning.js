const Earning = require('../Models/earning');

// Get earnings for logged-in creator
exports.getEarnings = async (req, res) => {
    try {
        const creatorId = req.user._id;
        const earnings = await Earning.findOne({ creator: creatorId });
        if (!earnings) return res.status(404).json({ message: 'No earnings found' });
        res.json(earnings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Request withdrawal
exports.requestWithdrawal = async (req, res) => {
    try {
        const creatorId = req.user._id;
        const { amount } = req.body;

        if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

        const earnings = await Earning.findOne({ creator: creatorId });
        if (!earnings) return res.status(404).json({ message: 'No earnings found' });

        if (amount > earnings.available_balance)
            return res.status(400).json({ message: 'Insufficient balance' });

        earnings.available_balance -= amount;
        earnings.pending_withdrawals += amount;
        earnings.transactions.push({ type: 'debit', amount, description: 'Withdrawal request', status: 'pending' });

        await earnings.save();
        res.json({ message: 'Withdrawal requested', earnings });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add earning (credit) from course sale
exports.addCredit = async (creatorId, amount, description) => {
    const earnings = await Earning.findOne({ creator: creatorId });
    if (!earnings) {
        const newEarning = new Earning({
            creator: creatorId,
            total_earned: amount,
            available_balance: amount,
            transactions: [{ type: 'credit', amount, description }]
        });
        await newEarning.save();
    } else {
        earnings.total_earned += amount;
        earnings.available_balance += amount;
        earnings.transactions.push({ type: 'credit', amount, description });
        await earnings.save();
    }
};
