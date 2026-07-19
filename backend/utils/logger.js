class Logger {
  constructor() {
    this.startTime = 0;
  }

  start() {
    this.startTime = Date.now();
    console.log("\n🚀 ===============================");
    console.log("🚀 NEXA PIPELINE STARTED");
    console.log("🚀 ===============================\n");
  }

  info(module, message) {
    console.log(`🔵 [${module}] ${message}`);
  }

  success(module, message) {
    console.log(`🟢 [${module}] ${message}`);
  }

  warn(module, message) {
    console.log(`🟡 [${module}] ${message}`);
  }

  error(module, error) {
    console.log(`🔴 [${module}] ERROR`);

    if (error instanceof Error) {
      console.log(`   Message : ${error.message}`);
      console.log(`   Stack   :`);
      console.log(error.stack);
    } else {
      console.log(`   ${error}`);
    }
  }

  finish() {
    const total = Date.now() - this.startTime;

    console.log("\n🏁 ===============================");
    console.log(`🏁 Pipeline Finished (${total} ms)`);
    console.log("🏁 ===============================\n");
  }
}

module.exports = new Logger();
