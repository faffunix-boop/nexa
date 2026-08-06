const logger = require("../utils/logger");
const askGroq = require("../groq");

async function reviewer(data) {
  logger.info("Reviewer", "Menyemak hasil AI...");

  const { response, task, question, sendStatus = () => {} } = data;

  sendStatus("Reviewer sedang menyemak...");

  const issues = [];
  let finalResponse = response;

  if (!response || !response.trim()) {
    issues.push("AI tidak menghasilkan jawapan.");
  } else {
    // Perform live AI-powered code review and correctness check
    try {
      const reviewPrompt = `
Anda adalah Nexa Senior AI Reviewer (GPT-4o Level). Tugas anda adalah menilai draf jawapan yang dihasilkan oleh AI pembantu (Nexa) bagi soalan pengguna, mengenal pasti sebarang ralat (sintaks, logik, atau kandungan), dan memberikan jawapan yang diperbetul dan diperkemas sepenuhnya.

Soalan Pengguna:
${question}

Draf Jawapan AI:
${response}

Sila nilai draf ini dengan teliti mengikut jenis tugas (${task === "code" ? "Kod/Coding" : "Umum/General"}):
- Jika tugas adalah Kod: Pastikan tiada bug logik, ralat sintaks, atau bahagian kod yang terputus (placeholder seperti "// TODO" atau "// kod seterusnya di sini"). Jika ada ralat, betulkan kod tersebut secara langsung. Berikan jawapan dengan struktur blok kod yang betul dan lengkap.
- Jika tugas adalah Umum: Pastikan ketepatan maklumat, fakta yang betul, kelonggaran dalam struktur, serta nada profesional. Betulkan jika ada ayat yang mengelirukan atau fakta tidak tepat.

PANDUAN OUTPUT:
- Sila berikan draf jawapan yang telah diperbetul/dipertingkat sepenuhnya sebagai output anda.
- Jika draf asal SUDAH SEMPURNA dan tidak memerlukan sebarang perubahan, sila keluarkan semula draf asal tersebut BULAT-BULAT (secara verbatim) tanpa sebarang perubahan langsung.
- JANGAN letak sebarang ulasan peribadi anda di luar seperti "Berikut adalah kod yang dibetulkan:" atau "Draf ini sudah baik." Balas HANYA dengan teks/kod jawapan akhir yang bersih sahaja.
`;

      const reviewedText = await askGroq(reviewPrompt, { model: "llama-3.1-8b-instant" });
      if (reviewedText && reviewedText.trim()) {
        finalResponse = reviewedText.trim();
        logger.info("Reviewer", "Semakan AI-powered reviewer selesai dengan jayanya.");
      }
    } catch (err) {
      logger.warn("Reviewer", `AI reviewer gagal dijalankan: ${err.message}. Menggunakan draf asal.`);
    }
  }

  logger.success(
    "Reviewer",
    issues.length
      ? `${issues.length} isu ditemui.`
      : "Tiada isu ditemui."
  );

  return {
    ...data,
    response: finalResponse,
    review: {
      passed: issues.length === 0,
      issues
    }
  };
}

module.exports = reviewer;
