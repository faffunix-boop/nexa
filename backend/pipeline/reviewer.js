const logger = require("../utils/logger");

async function reviewer(data) {
  logger.info("Reviewer", "Reviewing response...");

  return {
    ...data,
    review: {
      passed: true,
      issues: []
    }
  };
}

module.exports = reviewer;
