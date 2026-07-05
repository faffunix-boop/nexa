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

  try {
    const task = await classifyTask(question);

    let answer;
    if (task === "code") {
      answer = await askCoding(question, history || []);
    } else {
      answer = await askGeneral(question, history || []);
    }

    res.json({ answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ada masalah pada server" });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server jalan di port ${port}!`);
});
