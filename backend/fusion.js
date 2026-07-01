const askGemini = require("./ai");
const askGroq = require("./groq");

async function fusionAnswer(question){

let gemini = "";
let groq = "";

try{
gemini = await askGemini(question);
}catch(e){
gemini = "";
}


try{
groq = await askGroq(question);
}catch(e){
groq = "";
}


const finalPrompt = `
Kamu adalah FusionAI.

Gabungkan dua jawapan AI ini menjadi SATU jawapan terbaik.

Jawapan Gemini:
${gemini}

Jawapan Groq:
${groq}

Soalan pengguna:
${question}

Buat jawapan akhir yang jelas, berguna, dan jangan sebut Gemini atau Groq.
`;


const final = await askGroq(finalPrompt);


return final;

}


module.exports = fusionAnswer;
