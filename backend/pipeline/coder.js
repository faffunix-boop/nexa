const logger = require("../utils/logger");

const askOpenRouter = require("../openrouter");
const askGroq = require("../groq");

async function coder(data) {
  logger.info("Coder", "Generating response...");

  const {
    provider,
    model,
    question,
    history = [],
    system = "",
    sendStatus = () => {}
  } = data;

  sendStatus("AI sedang menjana jawapan...");

  let response = "";

  try {

    if (provider === "groq") {

      response = await askGroq(question, {
        model,
        history,
        system
      });

    } else {

      response = await askOpenRouter(question, {
        model,
        history,
        system
      });

    }

    logger.success("Coder", "Response generated.");

    return {
      ...data,
      response
    };

  } catch (err) {

    logger.error("Coder", err);

    throw err;

  }

}

module.exports = coder;
