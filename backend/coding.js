const askOpenRouter = require("./openrouter");
const askGroq = require("./groq");

async function askCoding(question, history = []) {
  let draft;

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

  const reviewPrompt = `cari bug di code berikut, jika ada bug, buat code baru yang sudah diperbaiki.

Soalan:
${question}

Code:
${draft}`;

  try {
    const reviewed = await askGroq(reviewPrompt, {
      model: "qwen/qwen3-32b",
    });

    return reviewed?.trim() ? reviewed : draft;
  } catch {
    return draft;
  }
}

module.exports = askCoding;
