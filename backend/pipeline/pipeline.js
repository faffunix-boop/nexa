const logger = require("../utils/logger");

const router = require("./router");
const planner = require("./planner");
const coder = require("./coder");
const reviewer = require("./reviewer");
const validator = require("./validator");
const formatter = require("./formatter");

async function runPipeline(data) {
  const startTime = Date.now();
  let chosenProvider = null;
  let chosenModel = null;
  let taskCategory = data ? data.task : "general";

  logger.start(data.question);
  let currentModule = "";

  try {

    // ===========================
    // Router
    // ===========================

    currentModule = "Router";
    logger.moduleStart("Router");

    data = await router(data);
    chosenProvider = data.provider;
    chosenModel = data.model;
    taskCategory = data.task;

    logger.moduleSuccess("Router");

    logger.pipelineInfo({
      task: data.task,
      provider: data.provider,
      model: data.model
    });

    // ===========================
    // Planner
    // ===========================

    currentModule = "Planner";
    logger.moduleStart("Planner");

    data = await planner(data);

    logger.moduleSuccess("Planner");

    // ===========================
    // Coder, Reviewer, Validator (Self-Correction Loop)
    // ===========================

    const maxRetries = 3;
    let attempt = 0;
    let passedValidation = false;

    while (attempt < maxRetries && !passedValidation) {
      attempt++;
      currentModule = `Coder (Percubaan ${attempt})`;
      logger.moduleStart(currentModule);

      if (attempt === 1) {
        data = await coder(data);
      } else {
        // Self-correction phase
        if (data.sendStatus) {
          data.sendStatus(`Mengulang jana jawapan (Percubaan ${attempt}/${maxRetries}) kerana isu kualiti dikesan...`);
        }
        logger.info("Pipeline", `Melakukan pembetulan kendiri (Self-Correction) bagi percubaan ke-${attempt}`);
        data = await coder(data, {
          isCorrection: true,
          attempt,
          issues: data.validation || []
        });
      }

      logger.moduleSuccess(
        currentModule,
        `Response Length : ${data.response ? data.response.length : 0}`
      );

      // ===========================
      // Reviewer
      // ===========================

      currentModule = `Reviewer (Percubaan ${attempt})`;
      logger.moduleStart(currentModule);

      data = await reviewer(data);

      logger.moduleSuccess(
        currentModule,
        `Passed : ${data.review.passed}`
      );

      // ===========================
      // Validator
      // ===========================

      currentModule = `Validator (Percubaan ${attempt})`;
      logger.moduleStart(currentModule);

      data = await validator(data);

      logger.moduleSuccess(
        currentModule,
        `Valid : ${data.valid}`
      );

      if (data.valid) {
        passedValidation = true;
      } else {
        logger.info("Pipeline", `Percubaan ${attempt} gagal pengesahan dengan isu: ${data.validation ? data.validation.join("; ") : "Ralat tidak diketahui"}`);
      }
    }

    if (!passedValidation) {
      logger.info("Pipeline", "Had percubaan maksimum pembetulan kendiri dicapai. Meneruskan dengan jawapan semasa demi UX...");
    }

    // ===========================
    // Formatter
    // ===========================

    currentModule = "Formatter";
    logger.moduleStart("Formatter");

    const output = await formatter(data);

    logger.moduleSuccess("Formatter");

    logger.finish();

    return output;

  } catch (err) {

    if (currentModule) {
      logger.moduleFail(currentModule, err);
    }

    logger.error(err);

    throw err;

  }

}

module.exports = {
  runPipeline
};
