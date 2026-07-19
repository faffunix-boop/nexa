const askOpenRouter = require("./openrouter");
const askGroq = require("./groq");
const plan = require("./planner");
const validate = require("./validator");
const format = require("./formatter");
const logger = require("./logger");

async function askCoding(question, history = [], onProgress = () => {}) {
  const t0 = logger.start(question);

  // ---- Planner ----
  onProgress("Merancang pendekatan...");
  const rancangan = await plan(question);
  logger.stage("Planner", t0);

  // ---- Coder ----
  onProgress("AI sedang membuat code...");
  const contextPrompt = rancangan
    ? `Rancangan:\n${rancangan}\n\nSoalan pengguna: ${question}`
    : question;

  let draft;
  try {
    draft = await askOpenRouter(contextPrompt, {
      model: "tencent/hy3:free",
      history,
      system:
        "Kamu pakar coding. Tulis code dengan format kemas (indent betul, satu statement satu baris). " +
        "Untuk soalan simple, bagi code paling ringkas. Jangan reka konsep yang pengguna tak minta.",
    });
    if (!draft?.trim()) throw new Error("OpenRouter tidak mengembalikan jawapan.");
  } catch (err) {
    throw err;
  }
  logger.stage("Coder", t0);

  // ---- Reviewer ----
  onProgress("Code disemak...");
  const reviewPrompt = `Semak code berikut dan betulkan jika ada bug.

Soalan:
${question}

Code:
${draft}`;

  let reviewed;
  try {
    reviewed = await askGroq(reviewPrompt, { model: "qwen/qwen3-32b" });
    if (!reviewed?.trim()) reviewed = draft;
  } catch {
    reviewed = draft;
  }
  logger.stage("Reviewer", t0);

  // ---- Validator ----
  onProgress("Mengesahkan jawapan...");
  const validation = validate(reviewed);
  if (!validation.valid) {
    console.warn("[VALIDATOR] Isu dikesan:", validation.issues.join("; "));
  }
  logger.stage("Validator", t0);

  // ---- Formatter ----
  const finalAnswer = format(reviewed);
  logger.stage("Formatter", t0);

  logger.finish(t0);
  return finalAnswer;
}

module.exports = askCoding;
