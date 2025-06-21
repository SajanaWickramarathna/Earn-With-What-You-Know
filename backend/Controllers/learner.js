const User = require('../Models/user');
const bcrypt = require('bcryptjs');

exports.getLearners = async (req, res) => {
  try {
    const learners = await User.find({ role: 'Learner' });
    if (!learners || learners.length === 0) {
      return res.status(404).json({ message: "No learners found" });
    }
    res.status(200).json(learners);
  } catch (error) {
    res.status(500).json({ message: "Error fetching learners" });
  }
};

exports.getLearnerById = async (req, res) => {
  try {
    const id = req.query.id;
    const learner = await User.findOne({ user_id: id, role: 'Learner' });
    if (!learner) {
      return res.status(404).json({ message: "Learner not found" });
    }
    res.status(200).json(learner);
  } catch (error) {
    res.status(500).json({ message: "Error fetching learner" });
  }
};

exports.addLearner = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, address, phone } = req.body;

    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      return res.status(400).json({ message: "Learner with this email already exists." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const learner = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      profilePic: req.file ? `/uploads/${req.file.filename}` : "",
      address,
      phone,
      role: 'Learner',
    });

    await learner.save();
    res.status(201).json({ message: "Learner registered successfully", learner });
  } catch (error) {
    console.error("Error adding learner:", error);
    res.status(500).json({ message: "Error adding learner" });
  }
};

exports.updateLearner = async (req, res) => {
  try {
    const { firstName, lastName, email, address, phone } = req.body;
    const user_id = req.body.userId;

    const existingLearner = await User.findOne({ user_id, role: 'Learner' });
    if (!existingLearner) {
      return res.status(404).json({ message: "Learner not found" });
    }

    const profilePic = req.file ? `/uploads/${req.file.filename}` : existingLearner.profilePic;

    const updateData = {
      firstName,
      lastName,
      email,
      address,
      phone,
      profilePic,
    };

    const learner = await User.findOneAndUpdate({ user_id, role: 'Learner' }, updateData, { new: true });
    if (!learner) return res.status(404).json("Learner not found");

    res.json({ message: "Learner updated successfully", learner });
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.deleteLearner = async (req, res) => {
  try {
    const user_id = req.query.id;
    const learner = await User.findOneAndDelete({ user_id, role: 'Learner' });
    if (!learner) return res.status(404).json({ message: "Learner not found" });
    res.json({ message: "Learner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting learner" });
  }
};
