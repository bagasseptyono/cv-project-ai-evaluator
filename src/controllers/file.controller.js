const FileService = require("../services/file.service");

async function uploadFile(req, res, next) {
    try {
        if (!req.files.cv && !req.files.report) {
            return res
                .status(400)
                .json({ success: false, message: "CV or Report required" });
        }

        const cvFile = req.files.cv
            ? await FileService.createFile({
                  name: req.files.cv[0].originalname,
                  file: req.files.cv[0].filename,
                  type: "cv",
              })
            : null;

        const reportFile = req.files.report
            ? await FileService.createFile({
                  name: req.files.report[0].originalname,
                  file: req.files.report[0].filename,
                  type: "report",
              })
            : null;
        console.log(cvFile);

        res.status(201).json({
            success: true,
            message: "Files uploaded successfully",
            data: {
                cvId: cvFile?.id ?? null,
                reportId: reportFile?.id ?? null,
            },
        });
    } catch (err) {
        console.error("Upload error:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Internal Server Error",
        });
    }
}

module.exports = { uploadFile };
