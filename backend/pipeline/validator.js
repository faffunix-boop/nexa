const logger = require("../utils/logger");

async function validator(data) {
  logger.info("Validator", "Mengesahkan output...");

  const {
    response,
    review,
    sendStatus = () => {}
  } = data;

  sendStatus("Validator sedang menyemak...");

  let valid = true;
  const errors = [];

  if (!response || !response.trim()) {
    valid = false;
    errors.push("Output kosong.");
  }

  if (review && !review.passed) {
    valid = false;
    errors.push(...review.issues);
  }

  logger.success(
    "Validator",
    valid ? "Output sah." : "Output tidak sah."
  );

  return {
    ...data,
    valid,
    validation: errors
  };
}

module.exports = validator;
