// ==================================================================
// run-all-generators.js
// Master script to run all checkpoint generators
// ==================================================================

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = process.cwd();

console.log("🚀 Starting Checkpoint Generation...\n");

const scripts = [
  { file: "generate-checkpoint.js", name: "Git Checkpoint Generator" },
  { file: "generate-manifest-checklist.js", name: "Project Manifest Generator" },
  { file: "gop_code_V5.js", name: "Full Project Export + State" },
];

let successCount = 0;
let failCount = 0;

for (const script of scripts) {
  try {
    console.log(`\n📦 Running: ${script.name}...`);
    console.log(`   File: ${script.file}`);
    
    execSync(`node ${script.file}`, {
      cwd: ROOT,
      stdio: "inherit",
      encoding: "utf8"
    });
    
    console.log(`   ✅ Success!\n`);
    successCount++;
  } catch (error) {
    console.log(`   ❌ Failed!`);
    console.error(error.message);
    failCount++;
  }
}

// Final summary
console.log("\n" + "=".repeat(60));
console.log("📊 GENERATION SUMMARY");
console.log("=".repeat(60));
console.log(`✅ Successful: ${successCount}/${scripts.length}`);
console.log(`❌ Failed: ${failCount}/${scripts.length}`);

// List generated files
const OUT_DIR = path.join(ROOT, ".aido_out");
if (fs.existsSync(OUT_DIR)) {
  const files = fs.readdirSync(OUT_DIR);
  console.log(`\n📁 Generated files in .aido_out/:`);
  files.forEach(f => {
    const stat = fs.statSync(path.join(OUT_DIR, f));
    const size = (stat.size / 1024).toFixed(2);
    console.log(`   - ${f} (${size} KB)`);
  });
}

// Check AI_PROJECT_STATE.txt at root
const stateFile = path.join(ROOT, "AI_PROJECT_STATE.txt");
if (fs.existsSync(stateFile)) {
  const stat = fs.statSync(stateFile);
  const size = (stat.size / 1024).toFixed(2);
  console.log(`\n📄 Root state file:`);
  console.log(`   - AI_PROJECT_STATE.txt (${size} KB)`);
}

console.log("\n🎯 NEXT STEPS:");
console.log("   1. Open .aido_out/CHECKPOINT.json - Your current position");
console.log("   2. Open .aido_out/MANIFEST.json - Full project checklist");
console.log("   3. In NEW AI tab, load these files first");
console.log("   4. Continue from exact position");

console.log("\n✨ Generation Complete!\n");