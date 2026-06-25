const express = require('express');
const HttpError = require('../models/errorModel');
const Venue = require('../models/venue');
const jwt = require('jsonwebtoken');



// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ status: 'error', message: 'Access denied, admin only' });
    }
    next();
};
module.exports = isAdmin;
