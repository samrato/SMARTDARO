const service = require('../service/examService');

const createExamController = async (req, res) => {
    const { academicSessionId, courseId, type, examDate, startTime, endTime } = req.body;
    const tenantId = req.tenantId;

    if (!academicSessionId || !courseId || !type || !examDate || !startTime || !endTime) {
        return res.status(422).json({ message: "All fields are required" });
    }

    try {
        const exam = await service.createExam({ tenantId, academicSessionId, courseId, type, examDate, startTime, endTime });
        res.status(201).json({ status: "success", exam });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || "Failed to create exam" });
    }
};

const getExamsController = async (req, res) => {
    try {
        const exams = await service.getExams(req.tenantId, req.query.academicSessionId);
        res.json({ status: "success", exams });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch exams" });
    }
};

const allocateRoomController = async (req, res) => {
    const { examId, roomId, seatingCapacity } = req.body;
    const tenantId = req.tenantId;

    if (!examId || !roomId || !seatingCapacity) {
        return res.status(422).json({ message: "examId, roomId, and seatingCapacity are required" });
    }

    try {
        const allocation = await service.allocateExamRoom({ tenantId, examId, roomId, seatingCapacity });
        res.status(201).json({ status: "success", allocation });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || "Failed to allocate room for exam" });
    }
};

const getExamAllocationsController = async (req, res) => {
    try {
        const allocations = await service.getExamAllocations(req.tenantId, req.params.examId);
        res.json({ status: "success", allocations });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch allocations" });
    }
};

const assignInvigilatorController = async (req, res) => {
    const { examAllocationId, invigilatorId } = req.body;
    const tenantId = req.tenantId;

    if (!examAllocationId || !invigilatorId) {
        return res.status(422).json({ message: "examAllocationId and invigilatorId are required" });
    }

    try {
        const assignment = await service.assignInvigilator({ tenantId, examAllocationId, invigilatorId });
        res.status(201).json({ status: "success", assignment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || "Failed to assign invigilator" });
    }
};

const getInvigilatorsController = async (req, res) => {
    try {
        const invigilators = await service.getInvigilatorsForAllocation(req.tenantId, req.params.examAllocationId);
        res.json({ status: "success", invigilators });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch invigilators" });
    }
};

module.exports = {
    createExamController,
    getExamsController,
    allocateRoomController,
    getExamAllocationsController,
    assignInvigilatorController,
    getInvigilatorsController
};
