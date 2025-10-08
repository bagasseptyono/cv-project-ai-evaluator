const prisma = require('../config/prisma.config');

async function createFile(fileData) {
  return await prisma.file.create({
    data: fileData,
  });
}

async function getFile(id) {
  return await prisma.file.findUnique({ where: { id } });
}

module.exports = {
    createFile,
    getFile
}
