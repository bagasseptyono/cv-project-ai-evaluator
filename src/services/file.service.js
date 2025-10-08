const FileRepository = require("../repositories/file.repository");
async function createFile(payload) {
    const fileData = {
        // name: payload.file || payload.name, // nama file (dari middleware multer)
        path:
            payload.type === "cv"
                ? `/public/cvs/${payload.file}`
                : `/public/reports/${payload.file}`,
        type: payload.type, // "cv" atau "report"
    };
    console.log(fileData);

    const createdFile = await FileRepository.createFile(fileData);

    return createdFile;
}

module.exports = {
    createFile,
};
