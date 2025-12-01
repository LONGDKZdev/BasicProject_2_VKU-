// ==================================================================
// GOP_CODE V3 — Ultimate Project Exporter (RAW code + AI Project State)
// Made for long-term reuse across Copilot/ChatGPT accounts
// Author: ChatGPT
// ==================================================================

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// --- Resolve correct folder (ESM compatibility) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- OUTPUT FILES ---
const RAW_OUTPUT = "TOAN_BO_DU_AN.txt";
const STATE_OUTPUT = "AI_PROJECT_STATE.txt";

// --- FOLDERS TO IGNORE ---
const IGNORE_DIRS = [
  "node_modules", ".git", ".vscode", "dist", "build", "public",
  "Project_Demo", "Query" // old
];

// --- FILES TO IGNORE ---
const IGNORE_FILES = [
  RAW_OUTPUT,
  STATE_OUTPUT,
  "package-lock.json",
  "yarn.lock",
  ".DS_Store",
  "gop_code.js",
  "README.md"
];

// --- EXTENSIONS TO INCLUDE ---
const ALLOWED_EXTS = [
  ".js", ".jsx", ".ts", ".tsx",
  ".css", ".scss",
  ".json",
  ".sql",
  ".env"
];

// ==================================================================
// SCAN FILES
// ==================================================================
function scanFiles(dir, list = []) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);

    // Skip folders
    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(item)) {
        scanFiles(full, list);
      }
    }

    // Skip unwanted files
    else {
      if (!IGNORE_FILES.includes(item)) {
        const ext = path.extname(item).toLowerCase();
        if (ALLOWED_EXTS.includes(ext) || item.startsWith(".env")) {
          list.push(full);
        }
      }
    }
  }
  return list;
}

// ==================================================================
// EXPORT RAW FILE (All Project Code)
// ==================================================================
function exportRaw(files) {
  let out = `
=====================================================
FULL PROJECT RAW EXPORT
Generated: ${new Date().toISOString()}
=====================================================

`;

  for (const file of files) {
    const rel = path.relative(__dirname, file);
    const content = fs.readFileSync(file, "utf8");

    out += `
=================================================================
FILE PATH: ${rel}
=================================================================
${content}

`;
  }

  fs.writeFileSync(RAW_OUTPUT, out);
  console.log(`✔ RAW EXPORT CREATED → ${RAW_OUTPUT}`);
}

// ==================================================================
// EXPORT AI PROJECT STATE
// ==================================================================
function exportProjectState() {
  const template = `
=====================================================
AI PROJECT STATE
Generated: ${new Date().toISOString()}
=====================================================

📌 PURPOSE:
This file helps Copilot/ChatGPT understand:
- the project structure
- current completion level
- what to build next
- how to behave consistently (no redundant files, no duplicated logic)
- how to continue development without asking again

=====================================================
PROJECT PROGRESS STATUS (AUTO)
=====================================================

Global Completion: auto
Frontend: auto
Backend: auto
Database Schema: auto
Authentication: auto
Admin Panel: auto
Booking System: auto
UI/UX Layout: auto
QA & Polish: auto

The AI should dynamically analyze the entire project code
and determine the correct completion percentage for each section.


=====================================================
NEXT DEVELOPMENT TASKS
=====================================================

1. Complete the booking calendar UI interaction.
2. Implement "reservation cancellation" API.
3. Improve admin dashboard filters & sorting.
4. Add validation to the profile settings form.
5. Optimize monthly statistics SQL queries.

(Modify tasks anytime to guide AI.)

=====================================================
AI BEHAVIOR RULES
=====================================================

- Do NOT generate unnecessary files (no extra .md, .txt, etc.)
- Always continue from the Task Queue above.
- Before coding, propose an improved plan for the next step.
- Follow existing architecture & file structure strictly.
- Reuse existing code patterns.
- NEVER duplicate features already implemented.
- Keep output minimal and efficient to save tokens.
- Never introduce libraries unless explicitly asked.
- NEVER guess — always follow the project state definition.

=====================================================
INSTRUCTIONS FOR COPILOT
=====================================================

When loading this file, respond:
"I have loaded the project state. Ready to continue development."

=====================================================
END OF FILE
=====================================================
`;

  fs.writeFileSync(STATE_OUTPUT, template);
  console.log(`✔ PROJECT STATE CREATED → ${STATE_OUTPUT}`);
}

// ==================================================================
// MAIN EXECUTION
// ==================================================================
function main() {
  console.log("⏳ Scanning files...");
  const files = scanFiles(__dirname);

  console.log(`📦 Files collected: ${files.length}`);

  exportRaw(files);
  exportProjectState();

  console.log("\n🎉 DONE! Your AI-ready files are generated.");
}

main();
