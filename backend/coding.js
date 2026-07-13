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
