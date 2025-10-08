const qdrant  = require('../config/qdrant.config')
const { genAI } = require('../config/gemini.config');

async function retrieveRelevantContext(query, limit = 5) {
  const res = await qdrant.search('rubrics', {
    vector: await embedText(query),
    limit,
  });
  return res.map(item => item.payload.text).join('\n');
}

async function upsertCollection(collection,id, data) {
  const res = await qdrant.upsert(collection, {
    points: [
        {
            id,
            vector: await genAI.models.embedContent({ model: "text-embedding-004", contents: data.overallSummary }).then(r => r.embeddings[0].values),
            payload: data,
        }
    ]
  })
  return res
}

// mock embedding dulu (bisa ganti pakai Gemini embedding API)
async function embedText(text) {
  return Array(768).fill(Math.random()); // dummy vector
} 

module.exports = { retrieveRelevantContext, upsertCollection }