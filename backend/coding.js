const askOpenRouter = require("./openrouter");

async function askCoding(question, history = []) {
  try {
    // AI pertama: buat code
    const draft = await askOpenRouter(question, {
      model: "tencent/hy3:free",
      history,
    });

    // AI kedua: fix bug (OpenRouter)
    const fixedCode = await askOpenRouter(draft, {
      model: "cohere/north-mini-code:free",
      system: `
You are a professional bug-fixing AI.

Your ONLY task is to detect and fix real bugs.

Rules:
- Fix only real bugs.
- Do not rewrite working code.
- Do not refactor.
- Do not optimize.
- Do not redesign.
- Do not add new features.
- Do not remove existing features.
- Do not rename variables or functions unless required.
- Preserve original logic and structure.
- Make the smallest possible changes.

If no bug exists, return the original code unchanged.

Output:
- Return ONLY complete code.
- No explanation.
- No markdown.
- No code fences.
- No analysis.
`,
      history: [],
    });

    return fixedCode;

  } catch (error) {
    console.error("askCoding error:", error.message);
    throw error;
  }
}

module.exports = askCoding;
