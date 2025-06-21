const User = require('../Models/user');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        if (!users) {
            return res.status(404).json({ message: "No users found" });
        }
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const id = req.query.id;
        const user = await User.findOne({ user_id: id });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user" });
    }
};

// ✅ New signup handler (replaces login)
exports.addUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, address, phone } = req.body;

        const isUserExist = await User.findOne({ email });
        if (isUserExist) {
            return res.status(400).json({ message: "User with this email already exists." });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            profilePic: req.file ? `/uploads/${req.file.filename}` : "",
            address,
            phone,
            role: "customer"
        });

        await user.save();
        res.status(201).json({ message: "User registered successfully", user });

    } catch (error) {
        console.error("Error adding user:", error);
        res.status(500).json({ message: "Error adding user" });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { firstName, lastName, email, address, phone } = req.body;
        const user_id = req.body.userId;

        const existingUser = await User.findOne({ user_id });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const profilePic = req.file ? `/uploads/${req.file.filename}` : existingUser.profilePic;

        const updateData = {
            firstName,
            lastName,
            email,
            address,
            phone,
            profilePic,
        };

        const user = await User.findOneAndUpdate({ user_id }, updateData, { new: true });
        if (!user) return res.status(404).json("User not found");

        res.json({ message: "User updated successfully", user });
    } catch (error) {
        res.status(500).json(error);
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user_id = req.query.id;
        const user = await User.findOneAndDelete({ user_id });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user" });
    }
};
