// ==================================================================
// auto-checkpoint.js
// Auto-update checkpoint after each git commit
// Chạy bằng: node auto-checkpoint.js
// ==================================================================

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, ".aido_out");

function ensureOut() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
}

function getGitInfo() {
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
    const commits = parseInt(execSync("git rev-list --count HEAD", { encoding: "utf8" }).trim());
    const lastMsg = execSync("git log -1 --pretty=%B", { encoding: "utf8" }).trim();
    const lastHash = execSync("git log -1 --pretty=%h", { encoding: "utf8" }).trim();
    const lastDate = execSync("git log -1 --pretty=%ai", { encoding: "utf8" }).trim();
    const modified = execSync("git status --short", { encoding: "utf8" }).split("\n").filter(l => l.trim()).length;

    return { branch, commits, lastMsg, lastHash, lastDate, modified };
  } catch (e) {
    console.error("❌ Git not available:", e.message);
    return null;
  }
}

function updateCheckpoint() {
  ensureOut();
  const gitInfo = getGitInfo();
  
  if (!gitInfo) {
    console.log("⚠️  Skipping checkpoint update - git unavailable");
    return;
  }

  const checkpoint = {
    updatedAt: new Date().toISOString(),
    projectName: "Hotel Booking System",
    git: {
      branch: gitInfo.branch,
      totalCommits: gitInfo.commits,
      lastCommit: {
        hash: gitInfo.lastHash,
        message: gitInfo.lastMsg,
        date: gitInfo.lastDate,
      },
      modifiedFiles: gitInfo.modified,
    },
    currentPhase: "Admin Component Integration",
    status: "IN_PROGRESS",
    progress: 50,
    
    lastActions: [
      "✅ Created: UsersManagement.jsx (352 lines)",
      "✅ Created: RoomsManagement.jsx (463 lines)",
      "✅ Created: BookingsManagement.jsx (389 lines)",
      "✅ Created: ProfileEdit.jsx (344 lines)",
      "⏳ TODO: Import components into Admin.jsx",
    ],

    nextTasks: [
      {
        priority: 1,
        title: "Update Admin.jsx imports",
        file: "src/pages/Admin.jsx",
        lines: "5-7, 21-24",
        effort: "5 mins",
        status: "READY",
      },
      {
        priority: 2,
        title: "Verify admin/index.js exports",
        file: "src/components/admin/index.js",
        effort: "5 mins",
        status: "PENDING",
      },
      {
        priority: 3,
        title: "Test ProfileEdit imports",
        file: "src/pages/ProfileEdit.jsx",
        effort: "5 mins",
        status: "PENDING",
      },
    ],

    resumeInstructions: `
When resuming in NEW AI tab:
1. Load this CHECKPOINT.json first
2. Read "nextTasks" array - shows exact position
3. Read "git.lastCommit.message" - what was just done
4. Load manifest.json + AI_PROJECT_STATE.txt for full context
5. Continue from priority 1 task

Quick resume message:
"Continuing Hotel Booking Project.
Phase: Admin Integration (${gitInfo.commits} commits)
Last: ${gitInfo.lastMsg}
Next: ${gitInfo.modified} files modified - ready to commit"
    `,
  };

  const outFile = path.join(OUT_DIR, "CHECKPOINT.json");
  fs.writeFileSync(outFile, JSON.stringify(checkpoint, null, 2), "utf8");
  
  console.log(`✅ Checkpoint updated at ${new Date().toLocaleTimeString()}`);
  console.log(`   Branch: ${gitInfo.branch}`);
  console.log(`   Commits: ${gitInfo.commits}`);
  console.log(`   Modified: ${gitInfo.modified} files`);
}

// Run
console.log("🔄 Auto-updating checkpoint...\n");
updateCheckpoint();
console.log("\n✨ Done!\n");