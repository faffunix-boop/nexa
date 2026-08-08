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
  } else {
    const trimmed = response.trim();

    // 1. Check for prompt leakages or internal thinking blocks
    if (trimmed.includes("<thought>") || trimmed.includes("</thought>")) {
      valid = false;
      errors.push("Jawapan mengandungi blok pemikiran dalaman (<thought> / </thought>). Sila berikan jawapan bersih terus kepada pengguna.");
    }

    if (trimmed.includes("<scratchpad>") || trimmed.includes("</scratchpad>")) {
      valid = false;
      errors.push("Jawapan mengandungi draf tidak bersih (<scratchpad>). Sila berikan jawapan bersih terus.");
    }

    // 2. Check for unwanted role prefixes
    const badPrefixes = ["system:", "user:", "assistant:", "reviewer:", "validator:"];
    const lowerTrimmed = trimmed.toLowerCase();
    for (const prefix of badPrefixes) {
      if (lowerTrimmed.startsWith(prefix)) {
        valid = false;
        errors.push(`Jawapan tidak boleh bermula dengan prefix peranan "${prefix}". Sila berikan jawapan secara terus.`);
        break;
      }
    }
  }

  // 3. Compile issues from the Reviewer
  if (review && !review.passed) {
    valid = false;
    // Prevent duplicates in errors array
    for (const issue of review.issues) {
      if (!errors.includes(issue)) {
        errors.push(issue);
      }
    }
  }

  logger.success(
    "Validator",
    valid ? "Output sah." : `Output tidak sah. Isu dikesan: ${errors.join("; ")}`
  );

  return {
    ...data,
    valid,
    validation: errors
  };
}

module.exports = validator;
