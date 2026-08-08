const askOpenRouter = require("./openrouter");

async function classifyTask(question, history = []) {
  const prompt = `
Tentukan kategori mesej pengguna.

Balas SATU perkataan sahaja:
- code
- general

Mesej pengguna:
${question}
`;

  try {
    const result = await askOpenRouter(prompt, {
      model: "qwen/qwen3-235b-a22b-2507:free",
      system: "Balas hanya 'code' atau 'general'. Jangan beri penjelasan."
    });

    const task = result.trim().toLowerCase();

    return task === "code" ? "code" : "general";

  } catch (err) {
    console.error("[Router]", err);
    return "general";
  }
}

module.exports = classifyTask;
