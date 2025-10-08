const prisma = require("../config/prisma.config");
const qdrant = require("../config/qdrant.config");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const { genAI } = require("../config/gemini.config");
const Qdrant = require("../services/qdrant.service")

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
        console.log(rubrics);

        for (const rubric of rubrics) {
            const text = `
Rubric Type: ${rubric.type}
Rubric Title: ${rubric.title}
Parameters:
${rubric.parameters
    .map((p) => `${p.name}: ${p.description} (Weight: ${p.weight})`)
    .join("\n")}
`;

            // Buat embedding pakai Gemini
            const embeddingResponse = await genAI.models.embedContent({
                model: "text-embedding-004",
                contents: text,
            });
            const vector = embeddingResponse.embeddings[0].values;

            console.log(vector);

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

            console.log(` Ingested rubric "${rubric.title}" (${rubric.type})`);
        }

        await qdrant.upsert("rubrics", { points });

        console.log(
            `🎯 Successfully ingested ${points.length} rubrics into Qdrant.`
        );

        return res.status(200).json({
            success: true,
            message: `Successfully ingested ${points.length} rubrics into Qdrant.`,
        });
    } catch (error) {
        console.error(" Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to ingest rubrics",
            error: error.message,
        });
    }
}

async function ingestDocument(req, res, next) {
    try {
        const { type, title, notes } = req.body;
		const file = req.file
        if (!file) {
            return res
                .status(400)
                .json({ success: false, message: "File is required" });
        }
        if (!type) return res.status(400).json({ error: "Type is required" });

		const filePath = file.path;

        if (file.mimetype === "application/pdf") {
            const data = await pdfParse(fs.readFileSync(filePath));
            textContent = data.text;
        } else if (
            file.mimetype === "text/plain" ||
            file.originalname.endsWith(".txt")
        ) {
            textContent = fs.readFileSync(filePath, "utf8");
        } else {
            return res.status(400).json({ error: "Unsupported file type" });
        }

        const chunks = chunkText(textContent, 1000);
		console.log(textContent);
		

        let vectors = [];

        for (const [index, chunk] of chunks.entries()) {
            const embeddingResponse = await genAI.models.embedContent({
                model: "text-embedding-004",
                contents: chunk,
            });
            const vector = embeddingResponse.embeddings[0].values;

            vectors.push({
                id: Date.now() + index,
                vector: vector,
                payload: {
                    type,
                    title,
                    notes,
                    chunk_index: index,
                    content: chunk,
                },
            });
        }

		const checkcollection = await Qdrant.checkCollection("system_documents")
		if (!checkcollection) {
			await qdrant.recreateCollection("system_documents", {
				vectors: { size: 768, distance: "Cosine" },
			});
		}

        await qdrant.upsert("system_documents", {
            points: vectors,
        });

        fs.unlinkSync(filePath);

        return res.json({
            message: "Document ingested successfully",
            chunks: chunks.length,
            type,
        });
    } catch (error) {
        console.error("Ingest error:", error);
        res.status(500).json({ error: error.message });
    }
}

function chunkText(text, size = 1000) {
    const chunks = [];
    for (let i = 0; i < text.length; i += size) {
        chunks.push(text.slice(i, i + size));
    }
    return chunks;
}

module.exports = { ingestRubrics, ingestDocument };
