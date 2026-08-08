const logger = require("../utils/logger");
const askOpenRouter = require("../openrouter");

async function reviewer(data) {
  logger.info("Reviewer", "Menyemak hasil AI...");

  const { response, task, question, sendStatus = () => {} } = data;

  sendStatus("Reviewer sedang menganalisis kualiti...");

  const issues = [];

  // ==========================================
  // Heuristic / Rule-based Checks (Sangat kukuh & pantas)
  // ==========================================

  if (!response || !response.trim()) {
    issues.push("AI tidak menghasilkan sebarang jawapan.");
  } else {
    const trimmed = response.trim();

    // 1. Check for unclosed markdown code blocks (odd number of triple backticks)
    const codeBlockCount = (trimmed.match(/```/g) || []).length;
    if (codeBlockCount % 2 !== 0) {
      issues.push("Format block markdown tidak lengkap (terdapat triple backticks ``` yang tidak ditutup). Jawapan mungkin terpotong.");
    }

    if (task === "code") {
      // 2. Check for common code placeholders
      const placeholders = [
        "// todo",
        "// write code here",
        "// tulis kod di sini",
        "// masukkan kod",
        "// letak kod di sini",
        "/* write your code */",
        "// implement here",
        "// implementasikan di sini",
        "# tulis kod di sini",
        "# todo",
        "// insert code"
      ];
      const lowerResponse = trimmed.toLowerCase();
      for (const placeholder of placeholders) {
        if (lowerResponse.includes(placeholder)) {
          issues.push(`Mengandungi kod placeholder yang tidak lengkap: "${placeholder}". Sila berikan kod yang lengkap dan berfungsi sepenuhnya.`);
          break;
        }
      }

      // 3. Check for matching curly braces (nested block sanity check)
      const openBraces = (trimmed.match(/\{/g) || []).length;
      const closeBraces = (trimmed.match(/\}/g) || []).length;
      if (Math.abs(openBraces - closeBraces) > 3) {
        issues.push(`Struktur curly braces '{ }' tidak seimbang (buka: ${openBraces}, tutup: ${closeBraces}). Sila pastikan tiada syntax error.`);
      }

      // 4. Code response should contain at least one code block
      if (!trimmed.includes("```")) {
        issues.push("Jawapan kod tidak diletakkan di dalam block markdown ``` [language] ... ```.");
      }

      // 5. Code is too short
      if (trimmed.length < 50 && question.length > 30) {
        issues.push("Jawapan kod terlalu ringkas dan kelihatan tidak lengkap.");
      }

    } else {
      // General task checks
      // 1. Refusal check
      const lowerResponse = trimmed.toLowerCase();
      if (lowerResponse.includes("maaf, saya tidak") || lowerResponse.includes("as an ai language model")) {
        issues.push("AI memberikan maklum balas penolakan atau template standard yang tidak menjawab soalan.");
      }

      // 2. Formatting check: general answers should use markdown for better readability
      const hasMarkdown = trimmed.includes("#") || trimmed.includes("**") || trimmed.includes("- ") || trimmed.includes("* ") || trimmed.includes("\n\n");
      if (!hasMarkdown && trimmed.length > 150) {
        issues.push("Jawapan panjang tetapi tiada pemformatan Markdown (header, senarai, bold) yang membolehkannya mudah dibaca.");
      }
    }
  }

  // ==========================================
  // AI-Assisted Review (Jika kunci API tersedia)
  // ==========================================
  if (issues.length === 0 && response && response.trim() && process.env.OPENROUTER_KEY) {
    try {
      sendStatus("Reviewer AI sedang menyemak logik dan ketepatan...");

      const reviewPrompt = `
Kamu ialah AI Quality Reviewer. Tugas kamu adalah menilai sama ada jawapan pembantu AI telah menjawab soalan pengguna dengan betul, lengkap, dan tanpa sebarang ralat logik atau bug.

Soalan Pengguna:
${question}

Jawapan AI yang dijana:
---
${response}
---

Sila semak dengan teliti.
Jika jawapan sudah PERFECT, lengkap, dan tiada ralat, balas dengan SATU perkataan sahaja: PASSED
Jika terdapat isu, pepijat (bug), kod tidak lengkap, penerangan tidak tepat, atau arahan diabaikan, senaraikan setiap isu dalam baris baharu bermula dengan tanda '- '. Jangan balas 'PASSED' jika ada isu. Jawab dalam Bahasa Melayu.
`;

      const aiReviewResult = await askOpenRouter(reviewPrompt, {
        model: "openai/gpt-oss-20b:free", // fast and free model
        system: "Kamu ialah pakar penguji kualiti AI (QA Specialist)."
      });

      if (aiReviewResult && aiReviewResult.trim() && !aiReviewResult.includes("PASSED")) {
        const lines = aiReviewResult.split("\n")
          .map(line => line.trim())
          .filter(line => line.startsWith("-") || line.startsWith("*"));

        if (lines.length > 0) {
          logger.info("Reviewer", `Reviewer AI menemui ${lines.length} isu.`);
          issues.push(...lines.map(line => line.replace(/^[-*\s]+/, "")));
        }
      }
    } catch (err) {
      logger.info("Reviewer", `Panggilan Reviewer AI gagal (menggunakan semakan heuristik sahaja): ${err.message}`);
    }
  }

  logger.success(
    "Reviewer",
    issues.length
      ? `${issues.length} isu dikesan.`
      : "Tiada isu dikesan."
  );

  return {
    ...data,
    review: {
      passed: issues.length === 0,
      issues
    }
  };
}

module.exports = reviewer;
