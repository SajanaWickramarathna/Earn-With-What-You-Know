// Controllers/creatorController.js
const User = require('../Models/user'); // Assuming your user model is in Models/user.js
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const {sendVerificationEmail} = require("../utils/mailer");
require("dotenv").config();

exports.getCreators = async (req, res) => {
    try {
        const creators = await User.find({role:'creator'});
        res.status(200).json(creators);
    }catch (error) {
        res.status(500).json(error);
    }
};

exports.getCreatorById = async(req, res) => {
    try {
        const id = req.query.id;
        const creator = await User.findOne({user_id:id, role:'creator'});

        if(!creator) return res.status(404).json("Creator not found");

        res.status(200).json(creator);
    }catch (error) {
        res.status(500).json(error);
    }
};

exports.getCreatorByEmail = async (req, res) => {
    try {
        const email = req.body.email;
        const creator = await User.findOne({email:email, role:'creator'});

        if(!creator) return res.status(404).json("Creator not found");

        res.status(200).json(creator);
    }catch (error) {
        res.status(500).json(error);
    }
};

exports.addCreator = async(req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, address, phone, bio } = req.body;

        const isUserExist = await User.findOne({ email });
        if (isUserExist) {
            return res.status(400).json({ message: "User with this email already exists." });
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
            role: 'creator',
            address,
            phone,
            bio // 👈 added
        });
        await creator.save();

        const token = jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: "1h" });
        await sendVerificationEmail(email, token);

        res.status(200).json({ message: "Creator registered! Please check your email for verification." });
    } catch (error) {
        res.status(500).json(error);
        console.log(error);
    }
};


exports.updateCreator = async(req, res) => {
    try {
        const { firstName, lastName, email, address, phone, bio } = req.body;
        const user_id = req.body.userId;

        const existingCreator = await User.findOne({ user_id, role: 'creator' });
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
            bio, // 👈 added
            profilePic,
        };

        const creator = await User.findOneAndUpdate(
            { user_id, role: 'creator' },
            updateData,
            { new: true }
        );
        if (!creator) return res.status(404).json("Creator not found");

        res.json({ message: "Creator updated successfully", creator });
    } catch (error) {
        res.status(500).json(error);
    }
};


exports.updateCreatorPassword = async (req,res) => {
    try{
        const id = req.body.userId;
        const {password, confirmPassword} = req.body;

        if(password !== confirmPassword){
            return res.status(400).json({message: "Passwords do not match"});
        }

        const hashedPassword = await bcrypt.hash(password,12);
        const creator = await User.findOneAndUpdate({user_id: id, role: 'creator'},{password: hashedPassword},{new:true});

        res.status(200).json({message: "Password updated Successfully!"});
    }catch (error) {
        res.status(500).json(error);
    }
};

exports.deleteCreator = async(req, res) => {
    try{
        const id = req.query.id;
        const creator = await User.findOneAndDelete({user_id: id, role: 'creator'});
        res.status(200).json({message: "Creator deleted successfully!"});
    }catch (error) {
        res.status(500).json(error);
    }
};

exports.getCreatorNameById = async(req, res) => {
    try {
        const id = req.query.id;
        const creator = await User.findOne({ user_id: id, role: 'creator' }).select('-password');

        if(!creator) return res.status(404).json("Creator not found");

        res.status(200).json(creator);
    }catch (error) {
        res.status(500).json(error);
    }
};