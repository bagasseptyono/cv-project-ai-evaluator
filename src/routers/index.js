const router = require("express").Router();

// const authRoute = require('./auth.route');
// const departmentRoute = require('./department.route');
// const employeeRoute = require('./employee.route');
// const attendanceRoute = require('./attendance.route');
const UploadMiddleware = require("../middlewares/upload.middleware");
const FileController = require("../controllers/file.controller");
const EvaluateController = require("../controllers/evaluate.controller");
const { ingestRubrics } = require("../scripts/ingestRubric");

router.get("/", (req, res, next) => {
    res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Welcome",
        data: null,
    });
});

router.post(
    "/upload",
    UploadMiddleware.initializeUpload().fields([
        { name: "cv", maxCount: 1 },
        { name: "report", maxCount: 1 },
    ]),
    FileController.uploadFile
);

router.post('/evaluate', EvaluateController.createEvaluationJob)
router.post("/ingest/rubrics", ingestRubrics);

// router.post

module.exports = router;
