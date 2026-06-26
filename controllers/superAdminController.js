const db = require('../database/pgDb');

const getTenants = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT t.id, t.name, t.domain, t.settings, t.created_at as "createdAt",
                   COUNT(u.id)::int as "userCount"
            FROM tenants t
            LEFT JOIN users u ON t.id = u.tenant_id
            GROUP BY t.id
            ORDER BY t.created_at DESC
        `);
        res.json({ status: "success", tenants: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch tenants" });
    }
};

const updateTenantStatus = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const { status, plan } = req.body;

        const check = await db.query("SELECT settings FROM tenants WHERE id = $1", [tenantId]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: "Tenant not found" });
        }

        const currentSettings = check.rows[0].settings || {};
        if (status !== undefined) currentSettings.status = status;
        if (plan !== undefined) currentSettings.plan = plan;

        const result = await db.query(
            "UPDATE tenants SET settings = $1 WHERE id = $2 RETURNING id, name, domain, settings",
            [JSON.stringify(currentSettings), tenantId]
        );

        const cache = require('../service/redisService');
        await cache.deleteCache(`tenant_settings:${tenantId}`);

        res.json({ status: "success", tenant: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update tenant status" });
    }
};

const getPlatformStats = async (req, res) => {
    try {
        const tenantCount = await db.query("SELECT COUNT(*)::int as count FROM tenants");
        const userCount = await db.query("SELECT COUNT(*)::int as count FROM users");
        const activeUsers = await db.query("SELECT COUNT(*)::int as count FROM users WHERE tenant_id IS NOT NULL");
        const timetables = await db.query("SELECT COUNT(*)::int as count FROM timetable_versions");

        res.json({
            status: "success",
            stats: {
                totalInstitutions: tenantCount.rows[0].count,
                totalUsers: userCount.rows[0].count,
                activeUsers: activeUsers.rows[0].count,
                generatedTimetables: timetables.rows[0].count,
                revenue: (tenantCount.rows[0].count * 299),
                storageUsage: "1.2 GB",
                subscriptions: tenantCount.rows[0].count,
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch platform stats" });
    }
};

const deleteTenant = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const result = await db.query("DELETE FROM tenants WHERE id = $1 RETURNING id, name", [tenantId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Tenant not found" });
        }
        res.json({ status: "success", message: `Tenant ${result.rows[0].name} deleted successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete tenant" });
    }
};

const getPlatformStaff = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT id, full_name as "fullName", email, role, created_at as "createdAt"
            FROM users
            WHERE tenant_id IS NULL AND role != 'super_admin'
            ORDER BY created_at DESC
        `);
        res.json({ status: "success", staff: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch platform staff" });
    }
};

const createPlatformStaff = async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;
        if (!fullName || !email || !password || !role) {
            return res.status(422).json({ message: "Fill in all fields" });
        }

        const bcrypt = require('bcryptjs');
        const userCheck = await db.query("SELECT id FROM users WHERE LOWER(email) = LOWER($1)", [email]);
        if (userCheck.rows.length > 0) {
            return res.status(422).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            `INSERT INTO users (full_name, email, password, role, is_admin, tenant_id)
             VALUES ($1, $2, $3, $4, true, null) RETURNING id, full_name as "fullName", email, role`,
            [fullName, email.toLowerCase(), hashedPassword, role]
        );

        res.status(201).json({ status: "success", staff: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create platform staff member" });
    }
};

const deletePlatformStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            "DELETE FROM users WHERE id = $1 AND tenant_id IS NULL AND role != 'super_admin' RETURNING id, full_name as \"fullName\"",
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Staff member not found" });
        }
        res.json({ status: "success", message: `Platform staff member ${result.rows[0].fullName} removed` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete staff member" });
    }
};

module.exports = {
    getTenants,
    updateTenantStatus,
    getPlatformStats,
    deleteTenant,
    getPlatformStaff,
    createPlatformStaff,
    deletePlatformStaff
};
