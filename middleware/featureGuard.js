const db = require('../database/pgDb');
const cache = require('../service/redisService');
const HttpError = require('../models/errorModel');

const featureGuard = async (req, res, next) => {
    const tenantId = req.tenantId || (req.user && req.user.tenantId);
    if (!tenantId) {
        return next();
    }

    try {
        const cacheKey = `tenant_settings:${tenantId}`;
        let settings = await cache.getCache(cacheKey);

        if (!settings) {
            const result = await db.query(
                "SELECT settings FROM tenants WHERE id = $1",
                [tenantId]
            );
            settings = result.rows[0] ? result.rows[0].settings : {};
            await cache.setCache(cacheKey, settings, 300); // Cache for 5 minutes
        }

        const schoolType = settings.schoolType || 'university';
        const path = req.originalUrl || req.url;

        // University: allowed to access all endpoints
        if (schoolType === 'university') {
            return next();
        }

        // Restrictions for High School mode
        if (schoolType === 'high_school') {
            if (
                path.includes('/academic-catalogs/faculties') ||
                path.includes('/academic-catalogs/departments') ||
                path.includes('/api/exams') ||
                path.includes('/api/integrations')
            ) {
                return res.status(403).json({
                    status: 'error',
                    message: `Feature disabled: Your institution is configured in High School mode.`
                });
            }
        }

        // Restrictions for Primary/Lower School mode
        if (schoolType === 'primary') {
            if (
                path.includes('/academic-catalogs/faculties') ||
                path.includes('/academic-catalogs/departments') ||
                path.includes('/api/exams') ||
                path.includes('/api/integrations') ||
                path.includes('/api/course-streams') ||
                path.includes('/api/lecturer-constraints')
            ) {
                return res.status(403).json({
                    status: 'error',
                    message: `Feature disabled: Your institution is configured in Primary/Lower School mode.`
                });
            }
        }

        next();
    } catch (err) {
        console.error("Feature guard middleware error:", err);
        next();
    }
};

module.exports = featureGuard;
