const askGroq = require("./groq");

async function classifyTask(question, history = []) {
  const recentContext = history
    .slice(-4)
    .map((h) => `${h.role}: ${h.content}`)
    .join("\n");

  const prompt = `Klasifikasikan mesej TERKINI ni ke SATU kategori sahaja: code atau general.

code = soalan pasal programming, code, debug, error, function, script, syntax — ATAU soalan susulan
YANG JELAS berkaitan code (contoh: "ada lagi?", "macam mana nak fix ni", "kenapa error").

general = semua yang lain, TERMASUK filler/reaksi pendek yang TIDAK jelas maksud dia
(contoh: "Hmm", "Ok", "Oh", "Wah", "Apasih", "Betul ke") — walaupun mesej SEBELUM ni pasal code,
filler macam ni JANGAN dianggap soalan code, sebab ia mungkin cuma reaksi biasa, bukan permintaan.

Kalau ragu-ragu sama ada mesej tu genuinely soalan code atau cuma filler/reaksi — pilih GENERAL.

${recentContext ? `Konteks perbualan sebelum ni:\n${recentContext}\n` : ""}
Mesej TERKINI (klasifikasikan ni): ${question}

Jawab dengan SATU perkataan sahaja: code atau general.`;

  try {
    const result = await askGroq(prompt, { model: "openai/gpt-oss-20b" });
    const clean = result.trim().toLowerCase();
    if (clean.includes("code")) return "code";
    return "general";
  } catch (e) {
    return "general";
  }
}

module.exports = classifyTask;
