const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");

async function extractText(filePath) {
  if (!filePath) return "";

  // 🧭 Ensure absolute path
const fullPath = path.join(process.cwd(), filePath.replace(/^\/+/, ""));


  // 🛑 Check if file exists
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }

  // 📄 PDF vs Text
  if (fullPath.endsWith(".pdf")) {
    const buffer = fs.readFileSync(fullPath);
    const data = await pdf(buffer);
    return data.text;
  } else {
    return fs.readFileSync(fullPath, "utf8");
  }
}

module.exports = { extractText };
