const prisma = require("../config/prisma.config");

async function createJob(payload) {
    return await prisma.job.create({
        data: payload,
    });
}

async function getJobById(id) {
    return await prisma.job.findFirst({
        where: { id },
        include: { cvFile: true, reportFile: true },
    });
}

async function getJobByCvIdOrProjectId(payload) {
    return await prisma.job.findFirst({
        where: {
            OR: [
                { cvId: payload.cvId }, 
                { reportId: payload.reportId }
            ],
        },
    });
}

async function updateJobsStatus(jobId, status) {
  return await prisma.job.update({
    where: {
      id: jobId, // array of jobId
    },
    data: {
      status: status, // misal "processing" atau "completed"
    },
  })
}


module.exports = {
    createJob,
    getJobById,
    getJobByCvIdOrProjectId,
    updateJobsStatus
};
