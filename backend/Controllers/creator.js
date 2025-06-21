const User = require('../Models/user');
const bcrypt = require('bcryptjs');

exports.getCreators = async (req, res) => {
  try {
    const creators = await User.find({ role: 'Creator' });
    if (!creators || creators.length === 0) {
      return res.status(404).json({ message: "No creators found" });
    }
    res.status(200).json(creators);
  } catch (error) {
    res.status(500).json({ message: "Error fetching creators" });
  }
};

exports.getCreatorById = async (req, res) => {
  try {
    const id = req.query.id;
    const creator = await User.findOne({ user_id: id, role: 'Creator' });
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }
    res.status(200).json(creator);
  } catch (error) {
    res.status(500).json({ message: "Error fetching creator" });
  }
};

exports.addCreator = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, address, phone } = req.body;

    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      return res.status(400).json({ message: "Creator with this email already exists." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const creator = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      profilePic: req.file ? `/uploads/${req.file.filename}` : "",
      address,
      phone,
      role: 'Creator',
    });

    await creator.save();
    res.status(201).json({ message: "Creator registered successfully", creator });
  } catch (error) {
    console.error("Error adding creator:", error);
    res.status(500).json({ message: "Error adding creator" });
  }
};

exports.updateCreator = async (req, res) => {
  try {
    const { firstName, lastName, email, address, phone } = req.body;
    const user_id = req.body.userId;

    const existingCreator = await User.findOne({ user_id, role: 'Creator' });
    if (!existingCreator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    const profilePic = req.file ? `/uploads/${req.file.filename}` : existingCreator.profilePic;

    const updateData = {
      firstName,
      lastName,
      email,
      address,
      phone,
      profilePic,
    };

    const creator = await User.findOneAndUpdate({ user_id, role: 'Creator' }, updateData, { new: true });
    if (!creator) return res.status(404).json("Creator not found");

    res.json({ message: "Creator updated successfully", creator });
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.deleteCreator = async (req, res) => {
  try {
    const user_id = req.query.id;
    const creator = await User.findOneAndDelete({ user_id, role: 'Creator' });
    if (!creator) return res.status(404).json({ message: "Creator not found" });
    res.json({ message: "Creator deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting creator" });
  }
};
