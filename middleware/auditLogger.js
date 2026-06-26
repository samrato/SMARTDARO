const db = require('../database/pgDb');

const logAudit = async (req, action, entity, entityId) => {
    try {
        const tenantId = req.tenantId || (req.user && req.user.tenantId);
        const userId = req.user && req.user.id;
        if (!tenantId || !entityId) return;

        await db.query(
            `INSERT INTO audit_logs (tenant_id, user_id, action, entity, entity_id)
             VALUES ($1, $2, $3, $4, $5)`,
            [tenantId, userId || null, action, entity, entityId]
        );
    } catch (err) {
        console.error("Audit log failed:", err);
    }
};

module.exports = { logAudit };
