const HttpError = require('../models/errorModel');

const tenantMiddleware = (req, res, next) => {
    const headerTenantId = req.headers['x-tenant-id'];
    
    // Check if the user is a platform staff member (no tenant_id or platform role)
    const isPlatformStaff = req.user && (
        !req.user.tenantId || 
        ['super_admin', 'platform_admin', 'support', 'sales', 'finance', 'devops', 'developer', 'auditor'].includes(req.user.role)
    );
    
    if (isPlatformStaff) {
        req.tenantId = headerTenantId || '550e8400-e29b-41d4-a716-446655440000';
        return next();
    }
    
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
