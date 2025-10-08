const {GoogleGenAI} = require('@google/genai');

const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
// const model = genAI.models.getGenerativeModel({ model: "gemini-1.5-flash-latest" });


module.exports = {genAI}
