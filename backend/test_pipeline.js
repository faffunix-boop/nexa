const assert = require("assert");

// Mock the openrouter module to control the responses and test self-correction!
let callCount = 0;
const mockResponses = [
  // First call (standard): has a placeholder error to trigger Reviewer failure
  "Berikut adalah kod untuk menyelesaikan masalah anda:\n```javascript\nfunction solve() {\n  // TODO: letak kod di sini\n}\n```",
  // Second call (correction): has a clean, correct code to pass Reviewer
  "Berikut adalah kod lengkap yang telah dibetulkan:\n```javascript\nfunction solve() {\n  console.log('Selesai!');\n}\n```"
];

// Override openrouter in Node's require cache
require.cache[require.resolve("./openrouter")] = {
  id: require.resolve("./openrouter"),
  exports: async function(message, options) {
    callCount++;
    console.log(`[Mock OpenRouter] Dipanggil ke-${callCount} dengan model: ${options.model || 'default'}`);
    const res = mockResponses[callCount - 1] || mockResponses[mockResponses.length - 1];
    return res;
  },
  loaded: true
};

const { runPipeline } = require("./pipeline/pipeline");

async function testSelfCorrection() {
  console.log("Memulakan Ujian Pembetulan Kendiri Pipeline (Self-Correction)...");

  const data = {
    task: "code",
    question: "Tulis fungsi solve",
    sendStatus: (text) => console.log(`[Status UI] ${text}`)
  };

  const output = await runPipeline(data);

  console.log("\n--- HASIL PIPELINE ---");
  console.log(output);
  console.log("----------------------\n");

  assert.strictEqual(callCount, 2, "Pipeline sepatutnya membuat 2 panggilan OpenRouter (1 cubaan biasa + 1 pembetulan)");
  assert.ok(output.includes("console.log('Selesai!')"), "Hasil akhir sepatutnya mengandungi jawapan yang telah dibetulkan");
  assert.ok(!output.includes("// TODO"), "Hasil akhir tidak sepatutnya mengandungi placeholder");

  console.log("Ujian BERJAYA! Semua pengesahan pembetulan kendiri lulus.");
}

testSelfCorrection().catch(err => {
  console.error("Ujian GAGAL:", err);
  process.exit(1);
});
