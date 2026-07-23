const path = require("path");

function now() {
  return new Date().toLocaleTimeString("ms-MY", {
    hour12: false
  });
}

function line(error) {
  if (!error || !error.stack) return "-";

  const stack = error.stack.split("\n");

  for (const s of stack) {
    if (s.includes("backend")) {
      return s.trim();
    }
  }

  return stack[1]?.trim() || "-";
}

module.exports = {

  start() {
    console.log("\n========================================");
    console.log(`[${now()}]  PIPELINE START`);
    console.log("========================================");
  },

  finish() {
    console.log("========================================");
    console.log(`[${now()}]  PIPELINE FINISH`);
    console.log("========================================\n");
  },

  info(module, message) {
    console.log(`[${now()}]   ${module}`);
    console.log(`   ${message}`);
  },

  success(module, message) {
    console.log(`[${now()}]  ${module}`);
    console.log(`   ${message}`);
  },

  warn(module, message) {
    console.log(`[${now()}]  ${module}`);
    console.log(`   ${message}`);
  },

  error(module, err) {

    console.log("\n========================================");
    console.log(`[${now()}]  ERROR`);
    console.log("========================================");

    console.log(`Module : ${module}`);

    console.log(
      `Type   : ${err.name || "Error"}`
    );

    console.log(
      `Reason : ${err.message || err}`
    );

    console.log(
      `Line   : ${line(err)}`
    );

    if (err.response) {

      console.log(
        `Status : ${err.response.status}`
      );

      console.log(
        "Response:"
      );

      console.log(err.response.data);

    }

    console.log("========================================\n");

  }

};
