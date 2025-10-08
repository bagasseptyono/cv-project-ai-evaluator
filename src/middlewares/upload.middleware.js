const multer = require("multer");
const path = require("path");
const fs = require("fs");

class UploadMiddleware {
  static initializeUpload() {
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        let dirPath;

        if (file.fieldname === "cv") {
          dirPath = path.join(__dirname, "../../public/cvs");
        } else if (file.fieldname === "report") {
          dirPath = path.join(__dirname, "../../public/reports");
        } else {
          return cb(new Error("Unknown file field"), false);
        }

        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }

        cb(null, dirPath);
      },

      filename: function (req, file, cb) {
        const timestamp = Date.now();
        const cleanName = file.originalname.toLowerCase().replace(/\s+/g, "-");
        cb(null, `${timestamp}-${cleanName}`);
      },
    });

    return multer({ storage });
  }
}

module.exports = UploadMiddleware;
