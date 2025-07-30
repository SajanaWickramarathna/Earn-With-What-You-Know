// Controllers/learnerController.js
const User = require('../Models/user'); // Assuming your user model is in Models/user.js
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const {sendVerificationEmail} = require("../utils/mailer");
require("dotenv").config();

exports.getLearners = async (req, res) => {
    try {
        const learners = await User.find({role:'learner'});
        res.status(200).json(learners);
    }catch (error) {
        res.status(500).json(error);
    }
};

exports.getLearnerById = async(req, res) => {
    try {
        const id = req.query.id;
        const learner = await User.findOne({user_id:id, role:'learner'});

        if(!learner) return res.status(404).json("Learner not found");

        res.status(200).json(learner);
    }catch (error) {
        res.status(500).json(error);
    }
};

exports.getLearnerByEmail = async (req, res) => {
    try {
        const email = req.body.email;
        const learner = await User.findOne({email:email, role:'learner'});

        if(!learner) return res.status(404).json("Learner not found");

        res.status(200).json(learner);
    }catch (error) {
        res.status(500).json(error);
    }
};

exports.addLearner = async(req, res) => {
    try {
        const {firstName, lastName, email, password, confirmPassword, address, phone} = req.body;

        const isUserExist = await User.findOne({email});

        if(isUserExist){
            return res.status(400).json({ message: "User with this email already exists." });
        }

        if(password !== confirmPassword){
            return res.status(400).json({message: "Passwords do not match"});
        }

        const hashedPassword = await bcrypt.hash(password,12);

        const learner = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            profilePic : req.file ? `/uploads/${req.file.filename}` : "",
            role: 'learner', // Set the role explicitly
            address,
            phone
        });
        await learner.save();

        const token = jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: "1h" });

        await sendVerificationEmail(email, token);

        res.status(200).json({ message: "Learner registered! Please check your email for verification." });
    }catch (error) {
        res.status(500).json(error);
        console.log(error);
    }
};

exports.updateLearner = async(req, res) => {
    try {
        const {firstName, lastName, email, address, phone} = req.body;
        const user_id = req.body.userId;

        const existingLearner = await User.findOne({user_id, role: 'learner'});
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

        const learner = await User.findOneAndUpdate({user_id, role: 'learner'}, updateData, {new:true});
        if(!learner) return res.status(404).json("Learner not found");
        console.log(learner);
        res.json({ message: "Learner updated successfully", learner });
    }catch (error) {
        res.status(500).json(error);
    }
};

exports.updateLearnerPassword = async (req,res) => {
    try{
        const id = req.body.userId;
        const {password, confirmPassword} = req.body;

        if(password !== confirmPassword){
            return res.status(400).json({message: "Passwords do not match"});
        }

        const hashedPassword = await bcrypt.hash(password,12);
        const learner = await User.findOneAndUpdate({user_id: id, role: 'learner'},{password: hashedPassword},{new:true});

        res.status(200).json({message: "Password updated Successfully!"});
    }catch (error) {
        res.status(500).json(error);
    }
};

exports.deleteLearner = async(req, res) => {
    try{
        const id = req.query.id;
        const learner = await User.findOneAndDelete({user_id: id, role: 'learner'});
        res.status(200).json({message: "Learner deleted successfully!"});
    }catch (error) {
        res.status(500).json(error);
    }
};

exports.getLearnerNameById = async(req, res) => {
    try {
        const id = req.query.id;
        const learner = await User.findOne({ user_id: id, role: 'learner' }).select('-password');

        if(!learner) return res.status(404).json("Learner not found");

        res.status(200).json(learner);
    }catch (error) {
        res.status(500).json(error);
    }
};