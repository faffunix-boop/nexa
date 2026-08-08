const askOpenRouter = require("./openrouter");

async function askGeneral(question, history = []) {
  // Use Qwen3 235B from OpenRouter for general queries as requested
  return await askOpenRouter(question, {
    model: "qwen/qwen3-235b-a22b-2507:free",
    history,
    system: "Kamu adalah Nexa, asisten AI yang bijak dan membantu. PENTING: Gunakan format Markdown yang kemas seperti header (###), senarai (bullet points), dan teks tebal (bold) untuk memastikan jawapan mudah dibaca dan tersusun. Jawab dalam Bahasa Melayu atau Bahasa Indonesia mengikut kesesuaian soalan."
  });
}

module.exports = askGeneral;
