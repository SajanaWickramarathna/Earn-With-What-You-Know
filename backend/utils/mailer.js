const nodemailer = require('nodemailer');
const User = require('../Models/user');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

exports.sendVerificationEmail = async (email, token) => {
    const verificationLink = `${process.env.FRONTEND_URL}/verify/${token}`;
    const mailOptions = {
        from:  `"CS Drop" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify your EWWYK account',
        html: `<h3>Click the link below to verify your email:</h3>
           <a href=${verificationLink}>${verificationLink}</a>`,
    }
    return transporter.sendMail(mailOptions);
};

exports.sendLearnerAccountCredentials = async (firstName, lastName, email, address, phone, password) => {
    const mailOptions = {
        from: `"EWWYK - Learner Support" <${process.env.EMAIL_USER}>`, // You can differentiate the 'from' name
        to: email,
        subject: "Your EWWYK Learner Account Information", // Specific subject
        html: `<h1>Welcome to EWWYK as a Learner!</h1><br><h3>Account Information</h3>
               <br><p><b>Name: </b> ${firstName} ${lastName}</p>
               <p><b>Email: </b> ${email}</p>
               <p><b>Address: </b> ${address}</p>
               <p><b>Phone Number: </b> ${phone}</p>
               <p><b>Password: </b> ${password}</p>
               <br><p style="color:#540000">Please change your default password and Profile Picture after logging in.</p>
               <p style="color:red">A verification link was sent to your email. Please check your Inbox or Spam folder.</p>`,
    }
    return transporter.sendMail(mailOptions);
};

// --- Creator Specific Emails ---

exports.sendCreatorAccountCredentials = async (firstName, lastName, email, address, phone, password) => {
    const mailOptions = {
        from: `"EWWYK - Creator Support" <${process.env.EMAIL_USER}>`, // You can differentiate the 'from' name
        to: email,
        subject: "Your EWWYK Creator Account Information", // Specific subject
        html: `<h1>Welcome to EWWYK as a Creator!</h1><br><h3>Account Information</h3>
               <br><p><b>Name: </b> ${firstName} ${lastName}</p>
               <p><b>Email: </b> ${email}</p>
               <p><b>Address: </b> ${address}</p>
               <p><b>Phone Number: </b> ${phone}</p>
               <p><b>Password: </b> ${password}</p>
               <br><p style="color:#540000">Please change your default password and Profile Picture after logging in.</p>
               <p style="color:red">A verification link was sent to your email. Please check your Inbox or Spam folder.</p>`,
    }
    return transporter.sendMail(mailOptions);
};

exports.sendResetPassword = async (email, token) => {
    const resetLink = `${process.env.FRONTEND_URL}/reset/${token}`;
    const mailOptions = {
        from:  `"EWWYK" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Reset password of your EWWYK account',
        html: `<h3>Click the link below to reset your passwrod:</h3>
           <a href=${resetLink}>${resetLink}</a>`,
    }
    return transporter.sendMail(mailOptions);
};

