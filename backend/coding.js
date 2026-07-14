const askOpenRouter = require("./openrouter");
const askGroq = require("./groq");

async function askCoding(question, history = []) {
  try {
    // AI pertama hasilkan code
    const draft = await askOpenRouter(question, {
      model: "tencent/hy3:free",
      history,
    });

    // AI kedua hanya semak & fix bug
    const fixedCode = await askGroq(draft, {
      model: "qwen/qwen3.6-27b",
      history: [],
      system: `
You are a professional bug-fixing AI.

Your ONLY task is to detect and fix real bugs.

Strict rules:
- Fix only real bugs.
- Do not rewrite working code.
- Do not refactor.
- Do not optimize.
- Do not redesign.
- Do not rename variables or functions unless required to fix a bug.
- Do not add or remove features.
- Preserve the original logic and structure.
- Make the smallest possible change.
- If no bug exists, return the original code unchanged.

Output rules:
- Return ONLY the complete code.
- No explanation.
- No analysis.
- No markdown.
- No code fences.
- No comments about the changes.
`
    });

    return fixedCode;

  } catch (error) {
    console.error("askCoding error:", error.message);
    throw error;
  }
}

module.exports = askCoding;
