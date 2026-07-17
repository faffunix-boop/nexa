const askOpenRouter = require("./openrouter");
const askGroq = require("./groq");

function extractCode(text) {
  if (!text) return "";

  const match = text.match(/```(?:\w+)?\s*([\s\S]*?)```/);

  if (match) {
    return "```" + match[1].trim() + "```";
  }

  return text.trim();
}

async function askCoding(question, history = [], onProgress = () => {}) {
  let draft;

  onProgress("AI sedang membuat code...");

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

  onProgress("Code disemak...");

  const reviewPrompt = `
TUGAS: BETULKAN CODE SAHAJA.

Peraturan ketat:
- Pulangkan hanya code akhir.
- Jangan beri penerangan.
- Jangan beri cadangan.
- Jangan tulis analisis.
- Jangan tambah feature.
- Kekalkan logik asal.
- Jika tiada bug, pulangkan code asal.

Soalan:
${question}

Code:
${draft}
`;

  try {
    const reviewed = await askGroq(reviewPrompt, {
      model: "qwen/qwen3.6-27b",
      system: `
Kamu adalah AI code fixer.

WAJIB:
- Output hanya code.
- Tiada ayat penjelasan.
- Tiada cadangan.
- Tiada analisis.
- Betulkan bug sahaja.
`,
    });

    return reviewed?.trim() ? extractCode(reviewed) : draft;

  } catch {
    return draft;
  }
}

module.exports = askCoding;
