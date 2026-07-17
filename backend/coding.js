const askOpenRouter = require("./openrouter");

async function askCoding(question, history = [], onProgress = () => {}) {
  let draft;

  onProgress("Laguna AI sedang membuat code...");

  try {
    draft = await askOpenRouter(question, {
      model: "tencent/hy3:free",
      history,
      system:
        "Kamu pakar coding. Tulis code dengan format kemas (indent betul, satu statement satu baris). " +
        "Untuk soalan simple, bagi code paling ringkas. Jangan reka konsep yang pengguna tak minta.",
    });

    if (!draft?.trim()) {
      throw new Error("OpenRouter tidak mengembalikan jawapan.");
    }
  } catch (err) {
    throw err;
  }

  onProgress("Code disemak oleh GPT...");

  const reviewPrompt = `Semak code berikut dan betulkan jika ada bug.

Soalan:
${question}

Code:
${draft}`;

  try {
    const reviewed = await askOpenRouter(reviewPrompt, {
      model: "qwen/qwen3-32b",
    });

    return reviewed?.trim() ? reviewed : draft;
  } catch {
    return draft;
  }
}

module.exports = askCoding;
