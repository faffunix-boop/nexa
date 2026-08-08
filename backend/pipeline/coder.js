const logger = require("../utils/logger");
const askOpenRouter = require("../openrouter");

async function coder(data, options = {}) {
  logger.info("Coder", "Menjana jawapan AI...");

  const {
    provider,
    model,
    question,
    history = [],
    system = "",
    sendStatus = () => {}
  } = data;

  const { isCorrection = false, attempt = 1, issues = [] } = options;

  if (isCorrection) {
    sendStatus(`AI sedang memperbetulkan jawapan (Percubaan ${attempt})...`);
  } else {
    sendStatus("AI sedang menjana jawapan...");
  }

  try {
    let response;

    if (isCorrection) {
      const previousResponse = data.response || "";
      const formattedIssues = issues.map((issue, idx) => `${idx + 1}. ${issue}`).join("\n");

      const correctionPrompt = `
Sila perbaiki dan betulkan jawapan anda yang terdahulu kerana ia tidak melepasi semakan kualiti atau pengesahan kami.

Sebab kegagalan / Isu dikesan:
${formattedIssues}

Soalan asal pengguna:
${question}

Jawapan anda yang terdahulu:
---
${previousResponse}
---

Sila berikan jawapan baharu yang LENGKAP, BETUL, dan SEPENUHNYA BEBAS daripada semua isu di atas. Ikut semua arahan asal dengan teliti.
`;

      response = await askOpenRouter(correctionPrompt, {
        model,
        history,
        system: system + "\n\nPENTING: Tugasan utama sekarang adalah untuk membetulkan isu-isu kualiti yang disenaraikan oleh penyemak di atas. Sila berikan jawapan atau kod yang lengkap, berfungsi sepenuhnya, tanpa sebarang kesalahan atau bahagian yang terpotong."
      });

    } else {
      // Incorporate plan steps into the coder prompt to align response and increase depth!
      let prompt = question;
      if (data.plan && data.plan.steps && data.plan.steps.length > 0) {
        const formattedSteps = data.plan.steps.map((step, idx) => `${idx + 1}. ${step}`).join("\n");
        prompt = `Sila ikuti pelan tindakan/langkah kerja di bawah untuk menjawab soalan pengguna dengan sempurna:\n${formattedSteps}\n\nSoalan Pengguna:\n${question}`;
      }

      response = await askOpenRouter(prompt, {
        model,
        history,
        system
      });
    }

    if (!response || !response.trim()) {
      throw new Error("AI tidak memberikan jawapan.");
    }

    logger.success("Coder", `Jawapan AI diterima. (Percubaan ${attempt})`);

    return {
      ...data,
      response
    };

  } catch (err) {
    throw err;
  }
}

module.exports = coder;
