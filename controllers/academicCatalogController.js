const service = require('../service/academicCatalogService');

const createFaculty = async (req, res) => {
    const { name, code } = req.body;
    const tenantId = req.tenantId;
    if (!name || !code) {
        return res.status(422).json({ message: "Faculty name and code are required" });
    }
    try {
        const faculty = await service.createFaculty({ tenantId, name, code });
        res.status(201).json({ status: "success", faculty });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || "Failed to create faculty" });
    }
};

const getFaculties = async (req, res) => {
    try {
        const faculties = await service.getFaculties(req.tenantId);
        res.json({ status: "success", faculties });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch faculties" });
    }
};

const createDepartment = async (req, res) => {
    const { facultyId, name, code } = req.body;
    const tenantId = req.tenantId;
    if (!facultyId || !name || !code) {
        return res.status(422).json({ message: "facultyId, department name, and code are required" });
    }
    try {
        const department = await service.createDepartment({ tenantId, facultyId, name, code });
        res.status(201).json({ status: "success", department });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || "Failed to create department" });
    }
};

const getDepartments = async (req, res) => {
    try {
        const departments = await service.getDepartments(req.tenantId, req.query.facultyId);
        res.json({ status: "success", departments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch departments" });
    }
};

const createUnit = async (req, res) => {
    const { departmentId, name, code, creditHours } = req.body;
    const tenantId = req.tenantId;
    if (!name || !code) {
        return res.status(422).json({ message: "Unit name and code are required" });
    }
    try {
        const unit = await service.createUnit({ tenantId, departmentId, name, code, creditHours });
        res.status(201).json({ status: "success", unit });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || "Failed to create unit" });
    }
};

const getUnits = async (req, res) => {
    try {
        const units = await service.getUnits(req.tenantId, req.query.departmentId);
        res.json({ status: "success", units });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch units" });
    }
};

const createCampus = async (req, res) => {
    const { name, location } = req.body;
    const tenantId = req.tenantId;
    if (!name) {
        return res.status(422).json({ message: "Campus name is required" });
    }
    try {
        const campus = await service.createCampus({ tenantId, name, location });
        res.status(201).json({ status: "success", campus });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || "Failed to create campus" });
    }
};

const getCampuses = async (req, res) => {
    try {
        const campuses = await service.getCampuses(req.tenantId);
        res.json({ status: "success", campuses });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch campuses" });
    }
};

module.exports = {
    createFaculty,
    getFaculties,
    createDepartment,
    getDepartments,
    createUnit,
    getUnits,
    createCampus,
    getCampuses
};
