const askGemini = require("./ai");
const askGroq = require("./groq");

async function fusionAnswer(question) {
  let gemini = "";
  let groq = "";

  try {
    gemini = await askGemini(question);
  } catch (e) {
    gemini = "";
  }

  try {
    groq = await askGroq(question);
  } catch (e) {
    groq = "";
  }

  if (!gemini && !groq) {
    throw new Error("Kedua-dua AI engine gagal jawab.");
  }
  if (!gemini) return groq;
  if (!groq) return gemini;

  const finalPrompt = `Kamu FusionAI, bercakap mesra dan natural macam ChatGPT — bukan kaku macam bot.

Gabungkan dua jawapan ni jadi satu jawapan terbaik, terus jawab mesej pengguna dengan tone tu:

Jawapan 1: ${gemini}
Jawapan 2: ${groq}

Mesej pengguna: ${question}`;

  const final = await askGroq(finalPrompt);
  return final;
}

module.exports = fusionAnswer;
