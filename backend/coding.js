const askOpenRouter = require("./openrouter");
const askGroq = require("./groq");

async function askCoding(question, history = []) {
  // Stage 1: Laguna generate draf code
  const draft = await askOpenRouter(question, {
    model: "poolside/laguna-m.1:free",
    history,
    system: "Kamu pakar coding. Tulis code dengan format kemas (indent betul, satu statement satu baris). " +
      "Untuk soalan simple, bagi code paling ringkas. Jangan reka konsep yang pengguna tak minta.",
  });

  // Stage 2: gpt-oss-120b semak & betulkan draf tu
  const reviewPrompt = `Semak code di bawah ni dengan teliti untuk cari BUG (logic error, syntax salah,
operator precedence tersilap, edge case terlepas). Kalau ada bug, BETULKAN terus dalam code.
Kalau code dah betul, kembalikan macam asal.

Balas dengan format SAMA macam draf asal (penjelasan + code block), jangan tambah komen
"saya dah semak" atau sebagainya — terus bagi versi akhir yang dah disahkan betul.

Soalan asal pengguna: ${question}

Draf code untuk disemak:
${draft}`;

  try {
    const reviewed = await askGroq(reviewPrompt, { model: "openai/gpt-oss-120b" });
    return reviewed;
  } catch (e) {
    // Kalau reviewer gagal, fallback ke draf asal Laguna (jangan crash)
    return draft;
  }
}

module.exports = askCoding;
