const askOpenRouter = require("./openrouter");

async function askCoding(question, history = []) {
  try {
    // AI pertama: buat code
    const draft = await askOpenRouter(question, {
      model: "tencent/hy3:free",
      history,
    });

    // AI kedua: fix bug (OpenRouter) & kemaskan struktur output dengan Markdown
    const fixedCode = await askOpenRouter(draft, {
      model: "cohere/north-mini-code:free",
      system: `
You are a professional code-refining, bug-fixing, and formatting AI.

Your tasks:
1. Detect and fix any real bugs in the code draft.
2. Format the code and structure the response beautifully using Markdown.
3. If multiple files are involved, always provide a clean folder/directory tree structure at the very beginning (e.g. using text-based tree like:
   myproject/
     myapp/
       views.py
   ).
4. Always use clear, professional Markdown headers for file names or file paths (e.g., "### 📁 myproject/myapp/views.py").
5. Enclose all code blocks inside triple backticks with the correct language tag (e.g., \`\`\`python, \`\`\`javascript, \`\`\`html) to ensure syntax highlighting works correctly in the chat UI. Do not leave code raw or unformatted.
6. Keep any explanations, instructions, or comments brief, extremely neat, organized, and helpful.

Rules:
- Preserve the original logic and functional correctness of the code.
- Ensure the code blocks are complete and never truncated.
- Make sure the layout is highly organized, readable, and clean (like a production-grade codebase structure).
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
