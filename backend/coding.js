const askOpenRouter = require("./openrouter");
const askGroq = require("./groq");

async function askCoding(question, history = []) {
  try {
    const draft = await askOpenRouter(question, {
      model: "tencent/hy3:free",
      history,
      system:
        "Kamu pakar coding. Tulis code dengan format kemas (indent betul, satu statement satu baris). " +
        "Untuk soalan simple, bagi code paling ringkas. Jangan reka konsep yang pengguna tak minta.",
    });

    return draft;
  } catch (error) {
    console.error("askCoding error:", error);
    throw error;
  }
}

module.exports = askCoding;
