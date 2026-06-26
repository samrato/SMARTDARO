const service = require('../service/reportService');

const getLecturerWorkload = async (req, res) => {
    try {
        const report = await service.getLecturerWorkload(req.tenantId);
        res.json({ status: "success", data: report });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to generate lecturer workload report" });
    }
};

const getRoomUtilization = async (req, res) => {
    try {
        const report = await service.getRoomUtilization(req.tenantId);
        res.json({ status: "success", data: report });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to generate room utilization report" });
    }
};

const getStudentTimetableReport = async (req, res) => {
    try {
        const report = await service.getStudentTimetableReport(req.tenantId);
        res.json({ status: "success", data: report });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to generate student timetable report" });
    }
};

const getExamUtilization = async (req, res) => {
    try {
        const report = await service.getExamUtilization(req.tenantId);
        res.json({ status: "success", data: report });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to generate exam utilization report" });
    }
};

const getConflictsReport = async (req, res) => {
    try {
        const report = await service.getConflictsReport(req.tenantId);
        res.json({ status: "success", data: report });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to generate conflicts report" });
    }
};

module.exports = {
    getLecturerWorkload,
    getRoomUtilization,
    getStudentTimetableReport,
    getExamUtilization,
    getConflictsReport
};
