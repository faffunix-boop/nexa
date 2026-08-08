const askOpenRouter = require("./openrouter");
const logger = require("./utils/logger");

async function askCoding(question, history = [], onProgress = () => {}) {
  onProgress("Merancang pendekatan...");
  logger.info("Coding", "Merancang pendekatan...");

  onProgress("AI sedang membuat code...");
  logger.info("Coding", "AI sedang membuat code...");

  let draft;
  try {
    draft = await askOpenRouter(question, {
      model: "openrouter/free",
      history,
      system:
        "Kamu pakar coding. Tulis code dengan format kemas (indent betul, satu statement satu baris). " +
        "PENTING: panjang/kelengkapan code kena SEPADAN dengan kompleksiti request — " +
        "untuk soalan betul-betul simple (contoh: print satu baris, function asas), bagi ringkas. " +
        "TAPI untuk request yang perlukan fungsi lengkap (contoh: game, app dengan banyak fitur, " +
        "sistem dengan pelbagai bahagian), bagi code YANG LENGKAP dan BERFUNGSI sepenuhnya — " +
        "jangan potong pendek atau tinggalkan bahagian penting sekadar nak 'ringkas'. " +
        "Jangan reka konsep yang pengguna tak minta.",
    });
    if (!draft?.trim()) throw new Error("OpenRouter tidak mengembalikan jawapan.");
  } catch (err) {
    throw err;
  }

  onProgress("Code disemak...");
  logger.info("Coding", "Code disemak...");
  const reviewPrompt = `Semak code berikut dan betulkan jika ada bug.

Soalan:
${question}

Code:
${draft}`;

  let reviewed;
  try {
    reviewed = await askOpenRouter(reviewPrompt, {
      model: "qwen/qwen3-235b-a22b-2507:free",
      system: "Anda adalah senior code reviewer. Balas hanya dengan kod yang dibetulkan tanpa ulasan lain."
    });
    if (!reviewed?.trim()) reviewed = draft;
  } catch {
    reviewed = draft;
  }

  onProgress("Mengesahkan jawapan...");
  logger.info("Coding", "Mengesahkan jawapan...");

  return reviewed;
}

module.exports = askCoding;
