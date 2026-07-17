const express = require("express");
const cors = require("cors");
const path = require("path");

const classifyTask = require("./router");
const askGeneral = require("./general");
const askCoding = require("./coding");

const app = express();

app.use(cors());
app.use(express.json());

const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));

app.post("/chat", async (req, res) => {
  const { question, history } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  if (res.flushHeaders) res.flushHeaders();

  function sendStatus(text) {
    res.write(`data: ${JSON.stringify({ type: "status", text })}\n\n`);
  }
  function sendAnswer(text) {
    res.write(`data: ${JSON.stringify({ type: "answer", text })}\n\n`);
    res.end();
  }
  function sendError(text) {
    res.write(`data: ${JSON.stringify({ type: "error", text })}\n\n`);
    res.end();
  }

  try {
    if (!question || !question.trim()) {
      return sendError("Mesej tak boleh kosong.");
    }

    const task = await classifyTask(question, history || []);

    let answer;
    if (task === "code") {
      answer = await askCoding(question, history || [], sendStatus);
    } else {
      sendStatus("GPT sedang berfikir...");
      answer = await askGeneral(question, history || []);
    }

    sendAnswer(answer);
  } catch (error) {
    console.error("Error in /chat:", error.response?.status, error.response?.data || error.message);
    sendError("Ada masalah pada server. Pastikan API key betul.");
  }
});

app.use((req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server jalan di port ${port}!`);
});
