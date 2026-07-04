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

  const finalPrompt = `Kamu FusionAI. Balas dengan natural macam orang bercakap biasa dalam chat —
tak payah tulis macam esei/artikel dengan tajuk dan bullet point walaupun soalan tu luas.

Tulis SATU jawapan baru yang koheren berdasarkan dua rujukan di bawah — jangan cantum/quote
terus ayat dari dua-dua, dan buang mana-mana bahagian yang tak match dengan mesej pengguna
(contoh: ucapan "selamat pagi" random yang tak relevan).

Rujukan 1: ${gemini}
Rujukan 2: ${groq}

Mesej pengguna: ${question}`;

  const final = await askGroq(finalPrompt);
  return final;
}

module.exports = fusionAnswer;
