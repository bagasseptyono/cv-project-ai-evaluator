const { genAI } = require("../config/gemini.config");

async function generateGemini(prompt) {
    const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    // const result = await model.generateContent(prompt);
    // const responseText = result.response.text();
    console.log(result.text);
    let responseText = result.text

    return responseText
    // responseText = responseText
    // .replace(/```json\s*/gi, "")
    // .replace(/```/g, "")
    // .trim();

    
    return JSON.parse(responseText);
}



module.exports = { generateGemini };
