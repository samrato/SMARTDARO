const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database/pgDb");

// ================== GENERATE TOKEN ==================
const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// ================== REGISTER USER ==================
const registerUser = async (req, res, next) => {
    try {
        const { fullName, email, password, password2, role, regNumber, departmentId, facultyId } = req.body;

        if (!fullName || !email || !password || !password2) {
            return res.status(422).json({ message: "Fill in all fields" });
        }

        const newEmail = email.toLowerCase();
        
        // Check existing user
        const existingRes = await db.query("SELECT id FROM users WHERE email = $1", [newEmail]);
        if (existingRes.rows.length > 0) {
            return res.status(422).json({ message: "Email already exists" });
        }

        if (regNumber) {
            const existingReg = await db.query("SELECT id FROM users WHERE LOWER(reg_number) = LOWER($1)", [regNumber]);
            if (existingReg.rows.length > 0) {
                return res.status(422).json({ message: "Registration number already exists" });
            }
        }

        if (password.trim().length < 6) {
            return res.status(422).json({ message: "Password must be at least 6 characters" });
        }

        if (password !== password2) {
            return res.status(422).json({ message: "passwords do not match" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const adminCheck = await db.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
        
        let userRole = 'student';
        if (role && ['admin', 'instructor'].includes(role)) {
            if (adminCheck.rows.length > 0) {
                let requestingUser = null;
                const authHeader = req.headers.authorization || req.headers.Authorization;
                if (authHeader && authHeader.startsWith("Bearer ")) {
                    const token = authHeader.split(" ")[1];
                    try {
                        requestingUser = jwt.verify(token, process.env.JWT_SECRET);
                    } catch (err) {
                        // ignore
                    }
                }
                if (!requestingUser || !requestingUser.isAdmin) {
                    return res.status(403).json({ message: "Only administrators can create admin or instructor accounts" });
                }
            }
            userRole = role;
        }

        const isAdmin = userRole === 'admin';
        const tenantId = (req.tenantId || (req.user && req.user.tenantId)) || '550e8400-e29b-41d4-a716-446655440000'; // Default Tenant

        await db.query(
            `INSERT INTO users (full_name, email, password, role, is_admin, tenant_id, reg_number, department_id, faculty_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [fullName, newEmail, hashedPassword, userRole, isAdmin, tenantId, regNumber || null, departmentId || null, facultyId || null]
        );

        res.status(201).json({ message: `User ${fullName} registered successfully` });
    } catch (error) {
        console.error("Registration Error:", error);
        return res.status(500).json({ message: "User registration Failed" });
    }
};

// ================== LOGIN USER ==================
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(422).json({ message: "Fill in all fields" });
        }

        const identifier = email.trim().toLowerCase();
        const userRes = await db.query(
            "SELECT * FROM users WHERE LOWER(email) = $1 OR LOWER(reg_number) = $1",
            [identifier]
        );

        if (userRes.rows.length === 0) {
            return res.status(422).json({ message: "Invalid Credentials" });
        }

        const user = userRes.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(422).json({ message: "Invalid credentials" });
        }

        const token = generateToken({ 
            id: user.id, 
            role: user.role, 
            isAdmin: user.is_admin, 
            tenantId: user.tenant_id 
        });

        res.json({ 
            token, 
            userId: user.id, 
            role: user.role, 
            isAdmin: user.is_admin, 
            tenantId: user.tenant_id 
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Login failed, try again later" });
    }
};

// ================== GET USER BY ID ==================
const getUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const userRes = await db.query(
            `SELECT id, full_name as "fullName", email, is_admin as "isAdmin", 
                    role, tenant_id as "tenantId", preferences, department_id as "departmentId", faculty_id as "facultyId"
             FROM users WHERE id = $1`,
            [userId]
        );

        if (userRes.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ status: "success", user: userRes.rows[0] });
    } catch (error) {
        console.error("Get User Error:", error);
        return res.status(500).json({ message: "Could not retrieve user" });
    }
};

// ================== UPDATE USER PREFERENCES ==================
const updateUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { preferences } = req.body;

        const updatedRes = await db.query(
            `UPDATE users 
             SET preferences = $1 
             WHERE id = $2 
             RETURNING id, full_name as "fullName", email, is_admin as "isAdmin", 
                       role, tenant_id as "tenantId", preferences`,
            [JSON.stringify(preferences || {}), userId]
        );

        if (updatedRes.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ status: "success", user: updatedRes.rows[0] });
    } catch (error) {
        console.error("Update User Preferences Error:", error);
        return res.status(500).json({ message: "Failed to update user preferences" });
    }
};

module.exports = { registerUser, loginUser, getUser, updateUser };
