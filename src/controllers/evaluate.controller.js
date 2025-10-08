const EvaluateService = require('../services/evaluate.service.js')
/**
 * POST /evaluate
 * Create new Job and start async evaluation
 */
const createEvaluationJob = async (req, res, next) => {
    try {
        const { title, cvId, reportId } = req.body;

        if (!title || !cvId || !reportId) {
            return res
                .status(400)
                .json({ message: "title, cvId, reportId are required" });
        }

        const job = await EvaluateService.createEvaluation(req.body)

        // // 2️⃣ Trigger async evaluation (without waiting)
        // setTimeout(() => runEvaluation(job.id), 0);

        // 3️⃣ Return immediately
        res.status(200).
        json(
            { id: job.id, status: job.status }
        );
    } catch (error) {
        next(error)
    }
};

/**
 * GET /result/:id
 * Retrieve job result (if completed)
 */
const getEvaluationResult = async (req, res) => {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
        where: { id: Number(id) },
        include: { result: true },
    });

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.json({
        id: job.id,
        status: job.status,
        result: job.result || null,
    });
};

module.exports = {
    createEvaluationJob,
}
