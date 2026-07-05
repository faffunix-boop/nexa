const askGroq = require("./groq");

async function askCoding(question, history = []) {
  return askGroq(question, {
    model: "qwen-2.5-coder-32b",
    history,
    system: "Kamu pakar coding. Bagi jawapan tepat, code yang betul, dan penjelasan ringkas.",
  });
}

module.exports = askCoding;
