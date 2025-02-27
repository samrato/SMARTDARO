const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const HttpError = require("../models/errorModel");



// ================== REGISTER USER ==================
//========== POST : api/users/register (Unprotected)
const registerUser = async (req, res, next) => {
    try {
        const { fullName, email, password, password2 } = req.body;

        if (!fullName || !email || !password || !password2) {
            return next(new HttpError("Fill in all fields", 422));
        }

        const newEmail = email.toLowerCase();
        const existingUser = await User.findOne({ email: newEmail });

        if (existingUser) {
            return next(new HttpError("Email already exists", 422));
        }

        if (password.trim().length < 6) {
            return next(new HttpError("Password must be at least 6 characters", 422));
        }

        if (password !== password2) {
            return next(new HttpError("Passwords do not match", 422));
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let isAdmin = newEmail === "onyangojuma984@gmail.com"; // Only specific email is admin

        const newUser = await User.create({ fullName, email: newEmail, password: hashedPassword, isAdmin });

        res.status(201).json({ message: `User ${fullName} registered successfully` });

    } catch (error) {
        console.error("Registration Error:", error);
        return next(new HttpError("User registration failed", 500));
    }
};

// ================== GENERATE TOKEN ==================
const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// ================== LOGIN USER ==================
//========== POST : api/users/login (Unprotected)
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new HttpError("Fill in all fields", 422));
        }

        const newEmail = email.toLowerCase();
        const user = await User.findOne({ email: newEmail }).select("+password");

        if (!user) {
            return next(new HttpError("Invalid credentials", 422));
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return next(new HttpError("Invalid credentials", 422));
        }

        const token = generateToken({ id: user._id, isAdmin: user.isAdmin });

        res.json({ token, userId: user._id, isAdmin: user.isAdmin });

    } catch (error) {
        console.error("Login Error:", error);
        return next(new HttpError("Login failed, try again later", 500));
    }
};

// ================== GET USER BY ID ==================
//========== GET : api/users/:userId (Protected)
const getUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return next(new HttpError("User not found", 404));
        }

        res.json({ status: "success", user });

    } catch (error) {
        console.error("Get User Error:", error);
        return next(new HttpError("Could not retrieve user", 500));
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
            return next(new HttpError("User not found", 404));
        }

        res.json({ status: "success", user: updatedUser });

    } catch (error) {
        console.error("Update User Preferences Error:", error);
        return next(new HttpError("Failed to update user preferences", 500));
    }
};

module.exports = { registerUser, loginUser, getUser, updateUser };








