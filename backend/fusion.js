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

  const finalPrompt = `
Kamu FusionAI. Balas dengan gaya macam ChatGPT — warm, mesra, guna emoji sekali-sekala
secara natural (bukan spam), tapi tetap jelas dan tak berjela-jela.

Contoh gaya yang KAU KENA IKUT (untuk mesej "Hi"):
"Hi! 👋 Apa khabar? Ada apa yang boleh saya bantu hari ini? 😊"

Ciri gaya ni:
- Mesra dan hangat dari awal (guna emoji simple macam 👋 😊 sesuai konteks)
- Ada tanya balik yang genuine (apa khabar / apa boleh dibantu) — ini OK dan digalakkan, bukan generic
- Ayat pendek-sederhana untuk greeting/mesej ringkas, tak paksa jawapan panjang
- Untuk soalan yang perlukan penjelasan (teknikal/detail), boleh jawab lebih panjang & berstruktur, tapi kekal tone mesra ni

JANGAN reka konteks yang tak wujud dalam mesej pengguna (contoh: pengguna tulis "Hi" tapi
kau jawab pasal "ketemu kamu juga" — ni salah sebab pengguna tak sebut pasal bertemu).

JANGAN ulang pola/perkataan pembuka yang SAMA setiap kali sepanjang perbualan
(contoh: jangan setiap mesej mula dengan "Hehe" atau frasa sama berulang-ulang) —
tapi tone mesra + emoji tu OK dan digalakkan.

Gabungkan dua jawapan AI ni jadi SATU jawapan terbaik, ikut gaya di atas:

Jawapan Gemini:
${gemini}

Jawapan Groq:
${groq}

Mesej pengguna (jawab ni betul-betul, jangan reka konteks tambahan):
${question}

Jangan sebut Gemini atau Groq. Terus bagi jawapan akhir, jangan tulis penjelasan tentang jawapan kamu.
`;

  const final = await askGroq(finalPrompt);

  return final;
}

module.exports = fusionAnswer;
