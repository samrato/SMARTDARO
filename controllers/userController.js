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
        const { fullName, email, password, password2, role } = req.body;

        if (!fullName || !email || !password || !password2) {
            return res.status(422).json({ message: "Fill in all fields" });
        }

        const newEmail = email.toLowerCase();
        
        // Check existing user
        const existingRes = await db.query("SELECT id FROM users WHERE email = $1", [newEmail]);
        if (existingRes.rows.length > 0) {
            return res.status(422).json({ message: "Email already exists" });
        }

        if (password.trim().length < 6) {
            return res.status(422).json({ message: "Password must be at least 6 characters" });
        }

        if (password !== password2) {
            return res.status(422).json({ message: "passwords do not match" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userRole = ['admin', 'instructor', 'student'].includes(role) ? role : 'student';
        const isAdmin = userRole === 'admin';
        const tenantId = req.tenantId || '550e8400-e29b-41d4-a716-446655440000'; // Default Tenant

        await db.query(
            `INSERT INTO users (full_name, email, password, role, is_admin, tenant_id)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [fullName, newEmail, hashedPassword, userRole, isAdmin, tenantId]
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

        const newEmail = email.toLowerCase();
        const userRes = await db.query("SELECT * FROM users WHERE email = $1", [newEmail]);

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
                    role, tenant_id as "tenantId", preferences 
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
