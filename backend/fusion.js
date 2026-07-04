const askGemini = require("./ai");
const askGroq = require("./groq");

async function fusionAnswer(question) {
  // 1. FILTER SAPAAN (Paling ampuh untuk elak AI overthinking)
  const sapaan = ["halo", "hai", "hi", "hello", "p", "ping", "oy", "yow", "assalamualaikum", "salam"];
  const teksUser = question.toLowerCase().trim();
  
  if (sapaan.includes(teksUser)) {
    return "Hai! Ada apa yang boleh dibantu hari ni?"; // Boleh tukar gaya ayat ni
  }

  // 2. Kalau bukan sapaan, baru jalankan AI
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

  // 3. Prompt Final yang diubah ke format LOGIK (IF/ELSE)
  const finalPrompt = `Sebagai FusionAI, ikut arahan mutlak ini:

MESEJ PENGGUNA: "${question}"

ARAHAN 1: Sila periksa mesej pengguna di atas.
ARAHAN 2: Jawab mesej tersebut berdasarkan dua rujukan di bawah. 
- Gunakan bahasa Melayu yang sangat santai, natural, terus ke poin utama dan tak skema.
- JANGAN cantum ayat bulat-bulat dari rujukan. 
- JANGAN mula dengan perkataan pelik macam "yow" berulang kali.
- Buang intro robot (cth: "Berdasarkan rujukan...").

Rujukan 1: ${gemini}
Rujukan 2: ${groq}`;

  const final = await askGroq(finalPrompt);
  return final;
}

module.exports = fusionAnswer;
