const JobRepository = require("../repositories/job.repository");
const ErrHandler = require("../utils/error.util");
const FileUtil = require("../utils/file.util");
const prisma = require("../config/prisma.config");

const Gemini = require("./gemini.service.js");
const Qdrant = require("./qdrant.service.js");

async function createEvaluation(data) {
    const checkJob = await JobRepository.getJobByCvIdOrProjectId(data);

    // if (checkJob.status != "queued") {
    //     throw new ErrHandler(400, "CV or Report has been evaluated or on evaluate process");
    // }

    const payload = {
        jobTitle: data.title,
        cvId: data.cvId,
        reportId: data.reportId,
        status: "queued",
    };
    const job = await JobRepository.createJob(payload);
    setTimeout(() => runEvaluation(job.id), 0);

    return job;
}

async function runEvaluation(jobId) {
    try {
        // 1️⃣ Ambil data job dan file

        await prisma.job.update({
            where: { id: jobId },
            data: { status: "processing" },
        });

        const job = await JobRepository.getJobById(jobId);
        if (!job) return;

        const rubrics = await prisma.scoringRubric.findMany({
            include: { parameters: true },
        });

        const cvRubric = rubrics.find((r) => r.type === "cv");
        const reportRubric = rubrics.find((r) => r.type === "project");

        // RAG - ambil konteks dari Qdrant
        const cvContext = await Qdrant.retrieveRelevantContext(
            `CV Evaluation for ${job.jobTitle}`
        );
        const reportContext = await Qdrant.retrieveRelevantContext(
            `report Evaluation for ${job.jobTitle}`
        );

        const cvText = await FileUtil.extractText(job.cvFile.path);
        const reportText = await FileUtil.extractText(job.reportFile.path);

        // 2️⃣ Prompt evaluasi Gemini
        const promptCv = `
Kamu adalah sistem evaluasi kandidat.
Berikan penilaian terhadap CV dan laporan berikut untuk pekerjaan: "${
            job.title
        }".
Context: ${cvContext}

Rubric:
${cvRubric.parameters
    .map((p) => `${p.name}: ${p.description} (weight ${p.weight})`)
    .join("\n")}

Candidate CV:
${cvText.slice(0, 4000)}

Return JSON:
{ "score": <number between 1 and 5>, "summary": string }
    `;



        const cvResult = await Gemini.generateGemini(promptCv);
        const cvJson = safeParseJson(cvResult) || { score: 0, summary: "Failed to parse CV evaluation" };


        console.log(cvJson);
        console.log(cvJson.score * 0.2);


        // project report
        const promptProject = `
Kamu adalah sistem evaluasi laporan proyek kandidat.
Evaluasi **Project Report** berikut berdasarkan rubric yang diberikan untuk pekerjaan: "${
            job.jobTitle
        }".

Context :
${reportContext}

Rubric:
${reportRubric.parameters
    .map((p) => `- ${p.name}: ${p.description} (Weight: ${p.weight})`)
    .join("\n")}

Candidate Project Report:
${reportText.slice(0, 4000)}

Return JSON:
{ "score": <number between 1 and 5>, "summary": string }
`;

        const projectResult = await Gemini.generateGemini(promptProject);
        const projectJson = safeParseJson(projectResult) || { score: 0, summary: "Failed to parse Project evaluation" };

        const overallSummary = await generateOverallSummary(cvJson, projectJson, job.jobTitle);

        // 7️⃣ Simpan hasil ke database
        const result = await prisma.evaluationResult.create({
            data: {
                cvScore: cvJson.score * 0.2,
                cvFeedback: cvJson.summary,
                projectScore: projectJson.score,
                projectFeedback: projectJson.summary,
                overallSummary: overallSummary,
            },
        });

        console.log(result);
        
        console.log("🎯 Evaluation completed and saved.");

        const evaluationVector = {
                jobId : jobId,
                cvScore: cvJson.score,
                projectScore: projectJson.score,
                overallSummary : overallSummary
            }
        const qdrantUpsert = await Qdrant.upsertCollection("evaluation_results", result.id, evaluationVector)
        if (!qdrantUpsert) {
            console.log("Failed Update Qdrant");
        }

        await prisma.job.update({
            where: { id: jobId },
            data: {
                resultId: result.id,
                status: "completed",
            },
        });

        console.log(`✅ Job ${jobId} completed`);
    } catch (err) {
        console.error("❌ Evaluation failed:", err);
    }
}

function safeParseJson(text) {
  try {
    // Cari kurung kurawal pertama dan terakhir
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first === -1 || last === -1) return null;

    const jsonStr = text.slice(first, last + 1);
    return JSON.parse(jsonStr);
  } catch (err) {
    return null;
  }
}


async function generateOverallSummary(cvResult, projectResult, cvContext, reportContext, jobTitle) {
    const prompt = `
Kamu adalah sistem evaluasi kandidat. Berdasarkan hasil evaluasi berikut, buat ringkasan singkat dan rekomendasi untuk kandidat pekerjaan: "${jobTitle}".

Context:
${cvContext}
${reportContext}



Hasil Evaluasi:
CV:
Score: ${cvResult.score}
Feedback: ${cvResult.summary}

Project Report:
Score: ${projectResult.score}
Feedback: ${projectResult.summary}

Keluarkan JSON:
{
  "overallSummary": "<ringkasan 3-5 kalimat, strengths, gaps, rekomendasi>"
}
    `;

    const rawResult = await Gemini.generateGemini(prompt);

    // Safe parse
    const overallJson = safeParseJson(rawResult) || { overallSummary: "Failed to generate overall summary" };
    return overallJson.overallSummary;
}



module.exports = {
    createEvaluation,
};
