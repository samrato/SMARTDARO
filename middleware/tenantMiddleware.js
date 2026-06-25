const HttpError = require('../models/errorModel');

const tenantMiddleware = (req, res, next) => {
    const headerTenantId = req.headers['x-tenant-id'];
    
    if (!req.user || !req.user.tenantId) {
        return next(new HttpError("Unauthorized: Token missing tenant validation context", 401));
    }

    if (!headerTenantId || headerTenantId !== req.user.tenantId) {
        return next(new HttpError("Access denied: Tenant ID spoofing detected", 403));
    }
    
    req.tenantId = req.user.tenantId;
    next();
};

module.exports = tenantMiddleware;
