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

const getExamByIdController = async (req, res) => {
    try {
        const exam = await service.getExamById(req.params.id, req.tenantId);
        if (!exam) return res.status(404).json({ message: "Exam not found" });
        res.json({ status: "success", exam });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch exam" });
    }
};

const updateExamController = async (req, res) => {
    try {
        const exam = await service.updateExam(req.params.id, req.tenantId, req.body);
        if (!exam) return res.status(404).json({ message: "Exam not found" });
        res.json({ status: "success", exam });
    } catch (err) {
        res.status(500).json({ message: "Failed to update exam" });
    }
};

const deleteExamController = async (req, res) => {
    try {
        const result = await service.deleteExam(req.params.id, req.tenantId);
        if (result.rowCount === 0) return res.status(404).json({ message: "Exam not found" });
        res.json({ status: "success", message: "Exam deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete exam" });
    }
};

const createSupplementaryExamController = async (req, res) => {
    const { academicSessionId, courseId, examDate, startTime, endTime } = req.body;
    const tenantId = req.tenantId;
    if (!academicSessionId || !courseId || !examDate || !startTime || !endTime) {
        return res.status(422).json({ message: "All fields are required" });
    }
    try {
        const exam = await service.createExam({ tenantId, academicSessionId, courseId, type: 'SUPPLEMENTARY', examDate, startTime, endTime });
        res.status(201).json({ status: "success", exam });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const createDeferredExamController = async (req, res) => {
    const { academicSessionId, courseId, examDate, startTime, endTime } = req.body;
    const tenantId = req.tenantId;
    if (!academicSessionId || !courseId || !examDate || !startTime || !endTime) {
        return res.status(422).json({ message: "All fields are required" });
    }
    try {
        const exam = await service.createExam({ tenantId, academicSessionId, courseId, type: 'DEFERRED', examDate, startTime, endTime });
        res.status(201).json({ status: "success", exam });
    } catch (err) {
        res.status(500).json({ message: err.message });
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

const scheduleExamsAIController = async (req, res) => {
    const { academicSessionId } = req.body;
    const tenantId = req.tenantId;
    if (!academicSessionId) return res.status(422).json({ message: "academicSessionId is required" });
    try {
        const allocations = await service.scheduleExamsAI({ tenantId, academicSessionId });
        res.json({ status: "success", message: "AI Exam Scheduling completed successfully", allocations });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || "AI Exam Scheduling failed" });
    }
};

const generateSeatingPlanController = async (req, res) => {
    const { id } = req.params; // examId
    const tenantId = req.tenantId;
    try {
        const seatingPlan = await service.generateSeatingPlan({ tenantId, examId: id });
        res.status(201).json({ status: "success", message: "Seating plan generated successfully", seatingPlan });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || "Failed to generate seating plan" });
    }
};

const getSeatingPlanController = async (req, res) => {
    try {
        const seatingPlan = await service.getSeatingPlan(req.tenantId, req.params.id);
        res.json({ status: "success", seatingPlan });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch seating plan" });
    }
};

const updateSeatAssignmentController = async (req, res) => {
    const { seatId } = req.params;
    const { seatNumber } = req.body;
    const tenantId = req.tenantId;
    if (!seatNumber) return res.status(422).json({ message: "seatNumber is required" });
    try {
        const seat = await service.updateSeatAssignment(seatId, tenantId, seatNumber);
        if (!seat) return res.status(404).json({ message: "Seat assignment not found" });
        res.json({ status: "success", seat });
    } catch (err) {
        res.status(500).json({ message: "Failed to update seat assignment" });
    }
};

module.exports = {
    createExamController,
    getExamByIdController,
    updateExamController,
    deleteExamController,
    createSupplementaryExamController,
    createDeferredExamController,
    getExamsController,
    allocateRoomController,
    getExamAllocationsController,
    assignInvigilatorController,
    getInvigilatorsController,
    scheduleExamsAIController,
    generateSeatingPlanController,
    getSeatingPlanController,
    updateSeatAssignmentController
};
