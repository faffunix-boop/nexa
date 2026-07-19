const logger = require("../utils/logger");

const router = require("./router");
const planner = require("./planner");
const coder = require("./coder");
const reviewer = require("./reviewer");
const validator = require("./validator");
const formatter = require("./formatter");

async function runPipeline(input) {
  logger.start();

  try {
    let data = await router(input);
    data = await planner(data);
    data = await coder(data);
    data = await reviewer(data);
    data = await validator(data);

    const output = await formatter(data);

    logger.success("Pipeline", "Finished successfully.");
    logger.finish();

    return output;

  } catch (err) {
    logger.error("Pipeline", err);
    throw err;
  }
}

module.exports = {
  runPipeline
};
