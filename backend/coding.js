const askOpenRouter = require("./openrouter");
const askGroq = require("./groq");

async function askCoding(question, history = []) {
  let draft;

  try {
    draft = await askOpenRouter(question, {
      model: "tencent/hy3:free",
      history,
    });

    const review = await askGroq(
      `Kamu adalah code reviewer.

Semak code ini:
${draft}

Jika ada bug, baiki.
Pulangkan keseluruhan code yang sudah diperbaiki.
Jangan beri penerangan.`,
      {
        model: "deepseek-r1-distill-qwen-32b",
        history,
      }
    );

    return review;

  } catch (error) {
    console.error("askCoding error:", error.message);
    throw error;
  }
}

module.exports = askCoding;
