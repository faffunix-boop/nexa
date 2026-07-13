const askOpenRouter = require("./openrouter");
const askGroq = require("./groq");

async function askCoding(question, history = []) {
  try {
    const draft = await askOpenRouter(question, {
      model: "tencent/hy3:free",
      history,
    });

    return draft;
  } catch (error) {
    console.error("askCoding error:", error);
    throw error;
  }
}

module.exports = askCoding;
