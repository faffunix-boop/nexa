const logger = require("../utils/logger");

async function router(input) {
  logger.info("Router", "Detecting task...");

  return {
    task: "code",
    model: "qwen/qwen3-30b-a3b",
    input
  };
}

module.exports = router;
