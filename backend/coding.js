const askOpenRouter = require("./openrouter");
const askGroq = require("./groq");

async function askCoding(question, history = []) {
  try {
    const draft = await askOpenRouter(question, {
      model: "tencent/hy3:free",
      history,
    });

    const review = await askGroq(
`SYSTEM:
You are a professional AI code repair tool.

TASK:
Inspect the code and return the corrected full code.

STRICT RULES:
- Output ONLY the final code.
- No explanation.
- No analysis.
- No summary.
- No comments about changes.
- No markdown code blocks.
- Preserve the original structure and features.
- Do not rewrite working parts.
- Only modify code when a real bug or error is found.
- Never remove features.
- If there is no bug, return the original code exactly.

CODE TO CHECK:
${draft}`,
      {
        model: "qwen/qwen3.6-27b",
        history: []
      }
    );

    return review;

  } catch (error) {
    console.error("askCoding error:", error.message);
    throw error;
  }
}

module.exports = askCoding;
