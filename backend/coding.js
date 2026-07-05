const askGroq = require("./groq");

async function askCoding(question, history = []) {
  return askGroq(question, {
    model: "openai/gpt-oss-120b",
    history,
    system: "Kamu pakar coding. Bagi jawapan tepat, code yang betul, dan penjelasan ringkas.",
  });
}

module.exports = askCoding;
