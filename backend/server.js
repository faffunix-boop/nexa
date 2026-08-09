require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

console.log("=================================");
console.log("Nexa Boot");
console.log("=================================");
console.log("OpenRouter Key :", !!process.env.OPENROUTER_KEY);
console.log("PORT           :", process.env.PORT || 3000);
console.log("=================================");

const classifyTask = require("./router");
const { runPipeline } = require("./pipeline/pipeline");
const { generateSpeech } = require("./openrouter");

const app = express();

function cleanTextForSpeech(text) {
  if (!text) return "";

  // 1. Remove code blocks entirely
  let cleaned = text.replace(/```[\s\S]*?```/g, "");

  // 2. Remove inline code blocks
  cleaned = cleaned.replace(/`([^`]+)`/g, "$1");

  // 3. Remove Markdown images
  cleaned = cleaned.replace(/!\[.*?\]\(.*?\)/g, "");

  // 4. Remove Markdown links, but keep the link text
  cleaned = cleaned.replace(/\[(.*?)\]\(.*?\)/g, "$1");

  // 5. Remove headers, list markers, bold, italic, blockquotes, horizontal rules
  cleaned = cleaned.replace(/^[#*+-\s]+|[*_~#>`\-]/gm, "");

  // 6. Normalize whitespace/newlines
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}

app.use(cors());
app.use(express.json());

const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));

app.post("/chat", async (req, res) => {
  const { question, history } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  if (res.flushHeaders) {
    res.flushHeaders();
  }

  function sendStatus(text) {
    res.write(
      `data: ${JSON.stringify({
        type: "status",
        text
      })}\n\n`
    );
  }

  function sendAnswer(text) {
    res.write(
      `data: ${JSON.stringify({
        type: "answer",
        text
      })}\n\n`
    );
    res.end();
  }

  function sendError(text) {
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        text
      })}\n\n`
    );
    res.end();
  }

  try {
    if (!question || !question.trim()) {
      return sendError("Mesej tak boleh kosong.");
    }

    sendStatus("Mengelaskan permintaan...");

    const task = await classifyTask(
      question,
      history || []
    );

    const answer = await runPipeline({
      task,
      question,
      history: history || [],
      sendStatus
    });

    sendAnswer(answer);

  } catch (error) {

    console.log("\n============= ERROR =============");
    console.error(error);
    console.error(error.stack);

    if (error.response) {
      console.log("HTTP Status :", error.response.status);
      console.log("Response :", error.response.data);
    }

    console.log("=================================\n");

    sendError(
      error.message || "Ada masalah pada server."
    );
  }
});

app.post("/speech", async (req, res) => {
  const { text } = req.body;

  try {
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Mesej tak boleh kosong." });
    }

    const cleanedText = cleanTextForSpeech(text);
    if (!cleanedText) {
      return res.status(400).json({ error: "Tiada teks yang boleh diucapkan selepas pembersihan." });
    }

    // Call OpenRouter generateSpeech
    const audioStream = await generateSpeech(cleanedText);

    res.setHeader("Content-Type", "audio/mpeg");
    audioStream.pipe(res);

  } catch (error) {
    console.error("[Speech Endpoint Error]:", error);
    res.status(500).json({ error: error.message || "Gagal menghasilkan suara." });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Nexa Server berjalan di port ${port}`);
});
