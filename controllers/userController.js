const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const HttpError = require("../models/errorModel");



// ================== GENERATE TOKEN ==================
const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// ================== REGISTER USER ==================
//========== POST : api/users/register (Unprotected)
const registerUser = async (req, res, next) => {
    try {
        const { fullName, email, password, password2, role } = req.body; // Added role to destructuring

        if (!fullName || !email || !password || !password2) {
            return res.status(422).json({message:"Fill in all fields"})
        }

        const newEmail = email.toLowerCase();
        const existingUser = await User.findOne({ email: newEmail });

        if (existingUser) {
            return res.status(422).json({message:"Email already exits "})

        }

        if (password.trim().length < 6) {
            return res.status(422).js({message:"Password must be at least 6 characters"})

        }

        if (password !== password2) {
            return res.status(422).json({message:"password do not match"})
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Determine the role for the new user. Default to 'student' if not provided or invalid.
        // For security, 'admin' and 'instructor' roles should typically not be set via public registration.
        const userRole = ['admin', 'instructor', 'student'].includes(role) ? role : 'student';

        // This isAdmin logic needs review - it's hardcoded and might be better handled by an admin interface.
        let isAdmin = newEmail === "onyangojuma984@gmail.com";

        const newUser = await User.create({ fullName, email: newEmail, password: hashedPassword, role: userRole, isAdmin }); // Assign the determined role

        res.status(201).json({ message: `User ${fullName} registered successfully` });

    } catch (error) {
        console.error("Registration Error:", error);
        return res.status(500).json({message:"User registration Failed"})

    }
};

// ================== LOGIN USER ==================
//========== POST : api/users/login (Unprotected)
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(422).json({message:"Fill in all fields"})

        }

        const newEmail = email.toLowerCase();
        const user = await User.findOne({ email: newEmail }).select("+password");

        if (!user) {
            return res.status(422).json({message:"Invalid Credentials "})

        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(422).json({message:"Invalid credentials"})
        }

        // Include user's role in the token payload and response
        const token = generateToken({ id: user._id, role: user.role });

        res.json({ token, userId: user._id, role: user.role }); // Return role in response too

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({message:"Login failed ,try again later"})

    }
};


// ================== GET USER BY ID ==================
//========== GET : api/users/:userId (Protected)
const getUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({message:"User not found"})
            
        }

        res.json({ status: "success", user });

    } catch (error) {
        console.error("Get User Error:", error);
        return res.status(500).json({message:"Could not retrive user"})
       
    }
};

// ================== UPDATE USER PREFERENCES ==================
//========== PUT : api/users/:userId (Protected)
const updateUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { preferences } = req.body;

        const updatedUser = await User.findByIdAndUpdate(userId, { preferences }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({message:"User not found"})
           
        }

        res.json({ status: "success", user: updatedUser });

    } catch (error) {
        console.error("Update User Preferences Error:", error);
        return next(new HttpError("Failed to update user preferences", 500));
    }
};

module.exports = { registerUser, loginUser, getUser, updateUser };








