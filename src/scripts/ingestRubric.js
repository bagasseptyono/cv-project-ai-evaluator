const prisma = require('../config/prisma.config');
const qdrant = require('../config/qdrant.config');
const { genAI } = require('../config/gemini.config');

async function ingestRubrics(req, res) {
  try {
    console.log("🔍 Starting rubric ingestion...");
    await qdrant.deleteCollection("rubrics");

    // Buat ulang collection rubrics di Qdrant
    await qdrant.recreateCollection("rubrics", {
      vectors: { size: 768, distance: "Cosine" },
    });

    // Ambil semua rubric + parameter dari Prisma
    const rubrics = await prisma.scoringRubric.findMany({
      include: { parameters: true },
    });

    let points = [];
    console.log(rubrics)

    for (const rubric of rubrics) {
      const text = `
Rubric Type: ${rubric.type}
Rubric Title: ${rubric.title}
Parameters:
${rubric.parameters.map(p => `${p.name}: ${p.description} (Weight: ${p.weight})`).join("\n")}
`;

      // Buat embedding pakai Gemini
      const embeddingResponse = await genAI.models.embedContent({
        model: "text-embedding-004",
        contents: text,
      });
      const vector = embeddingResponse.embeddings[0].values;

      console.log(vector)

      points.push({
        id: rubric.id,
        vector,
        payload: {
          rubricId: rubric.id,
          type: rubric.type,
          title: rubric.title,
          text,
        },
      });

      console.log(`✅ Ingested rubric "${rubric.title}" (${rubric.type})`);
    }

    await qdrant.upsert("rubrics", { points });

    console.log(`🎯 Successfully ingested ${points.length} rubrics into Qdrant.`);

    return res.status(200).json({
      success: true,
      message: `Successfully ingested ${points.length} rubrics into Qdrant.`,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to ingest rubrics",
      error: error.message,
    });
  }
}

module.exports = { ingestRubrics };
