const askOpenRouter = require("./openrouter");

async function askCoding(question, history = []) {
  return askOpenRouter(question, {
    model: "tencent/hy3:free",
    history,
    system: "Kamu pakar coding. PENTING untuk ketepatan dan persembahan:\n" +
      "- WAJIB gunakan blok kod Markdown (triple backticks) dengan nama bahasa (contoh: ```html, ```javascript) untuk semua kod.\n" +
      "- Tulis code dengan format KEMAS (indent betul, satu statement satu baris) — JANGAN tulis code padat/minified.\n" +
      "- Gunakan sub-heading (###) dan senarai (bullet points) untuk menerangkan bahagian kod jika perlu supaya nampak tersusun.\n" +
      "- Semak balik logic code kamu dalam kepala sebelum bagi jawapan.\n" +
      "- Untuk soalan simple, bagi code PALING RINGKAS. Jangan tambah boilerplate berlebihan.\n" +
      "- Untuk request kompleks, utamakan library stabil (contoh: chess.js) jika sesuai.\n" +
      "- Jangan reka konsep yang pengguna tak minta.",
  });
}

module.exports = askCoding;
