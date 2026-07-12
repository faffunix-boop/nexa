const askOpenRouter = require("./openrouter");

async function askCoding(question, history = []) {
  return askOpenRouter(question, {
    model: "poolside/laguna-m.1:free",
    history,
  });
}

module.exports = askCoding;
