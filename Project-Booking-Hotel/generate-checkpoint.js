// ==================================================================
// generate-checkpoint.js
// Auto-generate development checkpoint from git + project state
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

function getGitStatus() {
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
    const totalCommits = parseInt(
      execSync("git rev-list --count HEAD", { encoding: "utf8" }).trim()
    );
    const lastCommitMsg = execSync("git log -1 --pretty=%B", { encoding: "utf8" }).trim();
    const lastCommitHash = execSync("git log -1 --pretty=%h", { encoding: "utf8" }).trim();
    const lastCommitDate = execSync("git log -1 --pretty=%ai", { encoding: "utf8" }).trim();
    
    const statusOutput = execSync("git status --short", { encoding: "utf8" });
    const modifiedCount = statusOutput.split("\n").filter(line => line.trim()).length;

    return {
      branch,
      totalCommits,
      lastCommitMsg,
      lastCommitHash,
      lastCommitDate,
      modifiedCount,
      statusShort: statusOutput.split("\n").slice(0, 20).join("\n"), // First 20 lines
    };
  } catch (e) {
    return {
      branch: "unknown",
      totalCommits: 0,
      lastCommitMsg: "N/A",
      lastCommitHash: "N/A",
      lastCommitDate: "N/A",
      modifiedCount: 0,
      statusShort: "Git not available",
    };
  }
}

function countFiles(extensions = []) {
  let count = 0;
  const stack = [ROOT];
  const IGNORE_DIRS = new Set([
    "node_modules", ".git", ".vscode", "dist", "build", "public", ".aido_out", "Query", "Project_Demo"
  ]);

  while (stack.length) {
    const cur = stack.pop();
    try {
      const entries = fs.readdirSync(cur);
      for (const e of entries) {
        if (e.startsWith(".")) continue;
        const full = path.join(cur, e);
        const stat = fs.statSync(full);
        if (stat.isDirectory() && !IGNORE_DIRS.has(e)) {
          stack.push(full);
        } else if (stat.isFile()) {
          const ext = path.extname(full).toLowerCase();
          if (extensions.length === 0 || extensions.includes(ext)) {
            count++;
          }
        }
      }
    } catch (e) {
      // Skip on error
    }
  }
  return count;
}

function getCurrentTasks() {
  // Parse from recent git history what's being worked on
  return [
    {
      id: 1,
      title: "Update Admin.jsx imports",
      file: "src/pages/Admin.jsx",
      priority: "HIGH",
      status: "IN_PROGRESS",
      completion: 50,
      lineNumbers: "5-7, 21-24",
      description: "Add imports for UsersManagement, RoomsManagement, BookingsManagement components"
    },
    {
      id: 2,
      title: "Verify admin/index.js exports",
      file: "src/components/admin/index.js",
      priority: "MEDIUM",
      status: "PENDING",
      completion: 0,
      description: "Ensure all admin components are exported properly"
    },
    {
      id: 3,
      title: "Check ProfileEdit.jsx imports",
      file: "src/pages/ProfileEdit.jsx",
      priority: "MEDIUM",
      status: "PENDING",
      completion: 0,
      description: "Verify supabase import path and dependencies"
    },
  ];
}

function generateCheckpoint() {
  ensureOut();

  const gitStatus = getGitStatus();
  const currentTasks = getCurrentTasks();

  const checkpoint = {
    generatedAt: new Date().toISOString(),
    projectName: "Hotel Booking System",
    overview: {
      totalJSFiles: countFiles([".js", ".jsx", ".ts", ".tsx"]),
      totalSQLFiles: countFiles([".sql"]),
      totalFiles: countFiles([]),
    },
    git: gitStatus,
    currentPhase: "Admin Component Integration",
    phaseProgress: 50,
    currentTasks: currentTasks,
    completedPhases: [
      {
        phase: 1,
        name: "Database Schema (Query_V2)",
        status: "COMPLETED",
        files: ["01_Clean_Data.sql", "02_Int_schema.sql", "03_Setup_RLS.sql", "04_Full_seed_data.sql"],
      },
      {
        phase: 2,
        name: "Frontend Components",
        status: "COMPLETED",
        files: ["Header", "Footer", "Pagination", "BookForm", "Room", "RoomDetails"],
      },
      {
        phase: 3,
        name: "Admin Components Creation",
        status: "COMPLETED",
        files: ["UsersManagement.jsx", "RoomsManagement.jsx", "BookingsManagement.jsx", "AdminDashboard.jsx"],
      },
      {
        phase: 4,
        name: "Admin Integration",
        status: "IN_PROGRESS",
        progress: 50,
        files: ["Admin.jsx"],
      },
    ],
    nextSteps: [
      "1. Copy code for Admin.jsx import updates",
      "2. Verify admin/index.js exports",
      "3. Test ProfileEdit.jsx supabase connection",
      "4. Check adminService.js has all required methods",
      "5. Run build test",
    ],
    resumeInstructions: `
When resuming in a NEW AI tab:

1. Load this checkpoint file first
2. Read "currentTasks" - shows exact position
3. Use "nextSteps" to continue
4. Reference "git" section for recent commits
5. Use manifest.json + AI_PROJECT_STATE.txt for full context

To resume, copy this message:
"Continuing Hotel Booking Admin Phase. 
Current: Update Admin.jsx imports at lines ${currentTasks[0].lineNumbers}
Progress: ${currentTasks[0].completion}%
Git commits: ${gitStatus.totalCommits}
Last: ${gitStatus.lastCommitMsg}"
    `,
  };

  const outFile = path.join(OUT_DIR, "CHECKPOINT.json");
  fs.writeFileSync(outFile, JSON.stringify(checkpoint, null, 2), "utf8");
  console.log(`✅ Checkpoint generated: ${outFile}`);
  console.log(`📍 Current Task: ${currentTasks[0].title}`);
  console.log(`📊 Phase Progress: ${checkpoint.phaseProgress}%`);
  console.log(`🔗 Git: ${gitStatus.branch} (${gitStatus.totalCommits} commits)`);
}

generateCheckpoint();