const askGroq = require("./groq");

async function classifyTask(question) {
  const prompt = `Klasifikasikan mesej ni ke SATU kategori sahaja: code atau general.

code = soalan pasal programming, code, debug, error, function, script, syntax.
general = semua yang lain (sembang biasa, nasihat, pengetahuan umum, sejarah, konsep).

Jawab dengan SATU perkataan sahaja: code atau general.

Mesej: ${question}`;

  try {
    const result = await askGroq(prompt, { model: "openai/gpt-oss-20b" });
    const clean = result.trim().toLowerCase();
    if (clean.includes("code")) return "code";
    return "general";
  } catch (e) {
    return "general";
  }
}

module.exports = classifyTask;
