const axios = require("axios");
require("dotenv").config();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function makePostRequest(modelName, messages, apiKey, retryCount = 3) {
  let attempt = 0;
  while (attempt < retryCount) {
    attempt++;
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: modelName,
          messages,
        },
        {
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://render.com",
            "X-Title": "Nexa AI"
          },
          timeout: 45000 // 45 seconds timeout
        }
      );

      if (response && response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
        return response.data.choices[0].message.content;
      }
      throw new Error("Format respon OpenRouter tidak sah.");
    } catch (err) {
      console.warn(`[OpenRouter] Ralat semasa mencuba model "${modelName}" (Percubaan ${attempt}/${retryCount}):`, err.message);

      const isRateLimit = err.response && err.response.status === 429;
      const isServerError = err.response && err.response.status >= 500;
      const isTimeout = err.code === "ECONNABORTED";

      // If it is a 4xx error (other than 429), it's probably client error like authentication, bad model, etc., so we shouldn't retry that model.
      if (err.response && err.response.status >= 400 && err.response.status < 500 && !isRateLimit) {
        throw err;
      }

      if (attempt >= retryCount) {
        throw err;
      }

      // Exponential backoff
      const delay = attempt * 1500;
      console.log(`[OpenRouter] Menunggu ${delay}ms sebelum mencuba semula...`);
      await sleep(delay);
    }
  }
}

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

  const primaryModel = model || "openrouter/free";

  // Choose stable fallbacks
  const fallbacks = [
    primaryModel,
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemini-2.5-flash",
    "qwen/qwen-2.5-72b-instruct:free",
    "openrouter/free"
  ];

  // Remove duplicates while preserving order
  const uniqueModels = [...new Set(fallbacks)];

  const apiKey = process.env.OPENROUTER_KEY;
  if (!apiKey) {
    console.warn("[OpenRouter] Amaran: process.env.OPENROUTER_KEY tidak dijumpai.");
  }

  let lastError = null;

  for (const currentModel of uniqueModels) {
    try {
      const content = await makePostRequest(currentModel, messages, apiKey);
      if (content !== null && content !== undefined) {
        if (currentModel !== primaryModel) {
          console.log(`[OpenRouter] Berjaya menggunakan model fallback: ${currentModel}`);
        }
        return content;
      }
    } catch (err) {
      lastError = err;
      console.error(`[OpenRouter] Gagal mencuba model ${currentModel}:`, err.message);
      // Try next model in fallback list
    }
  }

  throw new Error(`Semua model OpenRouter gagal digunakan. Ralat terakhir: ${lastError ? lastError.message : "Ralat tidak diketahui"}`);
}

module.exports = askOpenRouter;
