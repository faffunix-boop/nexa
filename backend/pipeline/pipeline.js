const logger = require("../utils/logger");

async function runPipeline(input) {
  logger.start();

  try {
    logger.info("Pipeline", "Starting pipeline...");

    // Router
    logger.info("Router", "Waiting...");

    // Planner
    logger.info("Planner", "Waiting...");

    // Coder
    logger.info("Coder", "Waiting...");

    // Reviewer
    logger.info("Reviewer", "Waiting...");

    // Validator
    logger.info("Validator", "Waiting...");

    // Formatter
    logger.info("Formatter", "Waiting...");

    logger.success("Pipeline", "Pipeline completed successfully.");

    logger.finish();

    return {
      success: true,
      output: input,
    };
  } catch (err) {
    logger.error("Pipeline", err);

    return {
      success: false,
      error: err.message,
    };
  }
}

module.exports = {
  runPipeline,
};
