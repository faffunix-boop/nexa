const logger = require("../utils/logger");

async function validator(data) {
  logger.info("Validator", "Validating output...");

  return {
    ...data,
    valid: true
  };
}

module.exports = validator;
