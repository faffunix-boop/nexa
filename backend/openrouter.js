const axios = require("axios");
require("dotenv").config();

async function askOpenRouter(message, options = {}) {
  const { system, model, history } = options;

  const messages = [];
  if (system) {
    messages.push({ role: "system", content: system });
  }
  if (history && history.length) {
    messages.push(...history);
  }
  messages.push({ role: "user", content: message });

  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: model || "openrouter/free",
      messages,
    },
    {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://render.com", // Required by OpenRouter
        "X-Title": "Nexa AI" // Required by OpenRouter
      }
    }
  );

  return response.data.choices[0].message.content;
}

async function generateSpeech(text, options = {}) {
  const model = options.model || "fish-audio/s2.1-pro-free:free";

  const response = await axios.post(
    "https://openrouter.ai/api/v1/audio/speech",
    {
      model,
      input: text,
    },
    {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://render.com", // Required by OpenRouter
        "X-Title": "Nexa AI" // Required by OpenRouter
      },
      responseType: "stream"
    }
  );

  return response.data;
}

askOpenRouter.generateSpeech = generateSpeech;

module.exports = askOpenRouter;
