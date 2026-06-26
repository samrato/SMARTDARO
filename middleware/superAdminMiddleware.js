const isSuperAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'super_admin') {
        return res.status(403).json({ status: 'error', message: 'Access denied: Super Admin only' });
    }
    next();
};

module.exports = isSuperAdmin;
