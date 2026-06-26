const db = require('../database/pgDb');

class AcademicCatalogService {
    // Faculties
    async createFaculty({ tenantId, name, code }) {
        const result = await db.query(
            `INSERT INTO faculties (tenant_id, name, code)
             VALUES ($1, $2, $3) RETURNING *`,
            [tenantId, name, code.toUpperCase()]
        );
        return result.rows[0];
    }

    async getFaculties(tenantId) {
        const result = await db.query('SELECT * FROM faculties WHERE tenant_id = $1 ORDER BY name ASC', [tenantId]);
        return result.rows;
    }

    // Departments
    async createDepartment({ tenantId, facultyId, name, code }) {
        const result = await db.query(
            `INSERT INTO departments (tenant_id, faculty_id, name, code)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [tenantId, facultyId, name, code.toUpperCase()]
        );
        return result.rows[0];
    }

    async getDepartments(tenantId, facultyId) {
        let query = 'SELECT * FROM departments WHERE tenant_id = $1';
        const params = [tenantId];
        if (facultyId) {
            query += ' AND faculty_id = $2';
            params.push(facultyId);
        }
        query += ' ORDER BY name ASC';
        const result = await db.query(query, params);
        return result.rows;
    }

    // Units
    async createUnit({ tenantId, departmentId, name, code, creditHours }) {
        const result = await db.query(
            `INSERT INTO units (tenant_id, department_id, name, code, credit_hours)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [tenantId, departmentId || null, name, code.toUpperCase(), creditHours || 3]
        );
        return result.rows[0];
    }

    async getUnits(tenantId, departmentId) {
        let query = 'SELECT * FROM units WHERE tenant_id = $1';
        const params = [tenantId];
        if (departmentId) {
            query += ' AND department_id = $2';
            params.push(departmentId);
        }
        query += ' ORDER BY name ASC';
        const result = await db.query(query, params);
        return result.rows;
    }

    // Campuses
    async createCampus({ tenantId, name, location }) {
        const result = await db.query(
            `INSERT INTO campuses (tenant_id, name, location)
             VALUES ($1, $2, $3) RETURNING *`,
            [tenantId, name, location || null]
        );
        return result.rows[0];
    }

    async getCampuses(tenantId) {
        const result = await db.query('SELECT * FROM campuses WHERE tenant_id = $1 ORDER BY name ASC', [tenantId]);
        return result.rows;
    }

    async getCampusById(id, tenantId) {
        const result = await db.query('SELECT * FROM campuses WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
        return result.rows[0];
    }

    async updateCampus(id, tenantId, { name, location }) {
        const result = await db.query(
            `UPDATE campuses
             SET name = COALESCE($3, name),
                 location = COALESCE($4, location)
             WHERE id = $1 AND tenant_id = $2
             RETURNING *`,
            [id, tenantId, name, location]
        );
        return result.rows[0];
    }

    async deleteCampus(id, tenantId) {
        const result = await db.query('DELETE FROM campuses WHERE id = $1 AND tenant_id = $2 RETURNING *', [id, tenantId]);
        return result.rows[0];
    }
}

module.exports = new AcademicCatalogService();
