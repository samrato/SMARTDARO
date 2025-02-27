const express = require('express');
const HttpError = require('../models/errorModel');
const Venue = require('../models/venue');
const jwt = require('jsonwebtoken');



// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.isAdmin) {
            return res.status(403).json({ status: 'error', message: 'Access denied, admin only' });
        }
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ status: 'error', message: 'Authentication failed' });
    }
};
module.exports = isAdmin;
