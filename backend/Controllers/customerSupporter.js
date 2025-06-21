const User = require('../Models/user');
const bcrypt = require('bcryptjs');

exports.getSupporters = async (req, res) => {
  try {
    const supporters = await User.find({ role: 'customer_supporter' });
    if (!supporters || supporters.length === 0) {
      return res.status(404).json({ message: "No customer supporters found" });
    }
    res.status(200).json(supporters);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customer supporters" });
  }
};

exports.getSupporterById = async (req, res) => {
  try {
    const id = req.query.id;
    const supporter = await User.findOne({ user_id: id, role: 'customer_supporter' });
    if (!supporter) {
      return res.status(404).json({ message: "Customer supporter not found" });
    }
    res.status(200).json(supporter);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customer supporter" });
  }
};

exports.addSupporter = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, address, phone } = req.body;

    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      return res.status(400).json({ message: "Customer supporter with this email already exists." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const supporter = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      profilePic: req.file ? `/uploads/${req.file.filename}` : "",
      address,
      phone,
      role: 'customer_supporter',
    });

    await supporter.save();
    res.status(201).json({ message: "Customer supporter registered successfully", supporter });
  } catch (error) {
    console.error("Error adding customer supporter:", error);
    res.status(500).json({ message: "Error adding customer supporter" });
  }
};

exports.updateSupporter = async (req, res) => {
  try {
    const { firstName, lastName, email, address, phone } = req.body;
    const user_id = req.body.userId;

    const existingSupporter = await User.findOne({ user_id, role: 'customer_supporter' });
    if (!existingSupporter) {
      return res.status(404).json({ message: "Customer supporter not found" });
    }

    const profilePic = req.file ? `/uploads/${req.file.filename}` : existingSupporter.profilePic;

    const updateData = {
      firstName,
      lastName,
      email,
      address,
      phone,
      profilePic,
    };

    const supporter = await User.findOneAndUpdate({ user_id, role: 'customer_supporter' }, updateData, { new: true });
    if (!supporter) return res.status(404).json("Customer supporter not found");

    res.json({ message: "Customer supporter updated successfully", supporter });
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.deleteSupporter = async (req, res) => {
  try {
    const user_id = req.query.id;
    const supporter = await User.findOneAndDelete({ user_id, role: 'customer_supporter' });
    if (!supporter) return res.status(404).json({ message: "Customer supporter not found" });
    res.json({ message: "Customer supporter deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting customer supporter" });
  }
};
