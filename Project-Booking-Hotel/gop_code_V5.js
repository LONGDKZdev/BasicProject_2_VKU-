// ==================================================================
// gop_code_V5.js
// GOP_CODE V5 — Full Tech Stack & Supabase Deep Scan + AIDO state
// Outputs:
//   - TOAN_BO_DU_AN.txt         (full raw export)
//   - .aido_out/manifest.json   (compact manifest)
//   - .aido_out/snippets/*      (snippets to include in payload)
//   - AI_PROJECT_STATE.txt      (full state with TECH STACK + STRICT RULES)
// Author: ChatGPT (for user)
// ==================================================================

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = process.cwd();

const OUT_DIR = path.join(ROOT, ".aido_out");
const SNIPPET_DIR = path.join(OUT_DIR, "snippets");
const MANIFEST_FILE = path.join(OUT_DIR, "manifest.json");
const RAW_OUTPUT = path.join(OUT_DIR, "TOAN_BO_DU_AN.txt"); // put raw inside .aido_out to avoid polluting root
const STATE_OUTPUT = path.join(ROOT, "AI_PROJECT_STATE.txt"); // keep state at project root for convenience

// Config
const IGNORE_DIRS = new Set([
  "node_modules", ".git", ".vscode", "dist", "build", "public",
  ".aido_out", "Project_Demo", "Query" // "Query" old
]);
const IGNORE_FILES = new Set([
  ".DS_Store", "package-lock.json", "yarn.lock", "README.md"
]);
const ALLOWED_EXTS = new Set([
  ".js", ".jsx", ".ts", ".tsx",
  ".css", ".scss",
  ".json",
  ".sql",
  ".env",
  ".html"
]);

const SNIPPET_LINES = 40;
const DEFAULT_SNIPPETS = 12;

// ----------------- helpers -----------------
function ensureOut() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  if (!fs.existsSync(SNIPPET_DIR)) fs.mkdirSync(SNIPPET_DIR, { recursive: true });
}

function readSafe(p) {
  try { return fs.readFileSync(p, "utf8"); }
  catch (e) { return ""; }
}

function headLines(text, n = SNIPPET_LINES) {
  return text.split(/\r?\n/).slice(0, n).join("\n");
}

function extOk(file) {
  return ALLOWED_EXTS.has(path.extname(file).toLowerCase());
}

function isIgnoredDir(name) {
  return IGNORE_DIRS.has(name);
}

// ----------------- scan project files -----------------
function scanDir(root) {
  const files = [];
  const stack = [root];
  while (stack.length) {
    const cur = stack.pop();
    const entries = fs.readdirSync(cur);
    for (const e of entries) {
      if (IGNORE_FILES.has(e)) continue;
      const full = path.join(cur, e);
      let stat;
      try { stat = fs.statSync(full); } catch { continue; }
      if (stat.isDirectory()) {
        if (!isIgnoredDir(e)) stack.push(full);
      } else {
        const rel = path.relative(ROOT, full);
        if (extOk(full) || path.basename(full).startsWith(".env") || rel.toLowerCase().includes("query_v2")) {
          files.push({ full, rel, size: stat.size, mtime: stat.mtimeMs });
        }
      }
    }
  }
  return files;
}

// ----------------- scan Query_V2 SQL specifically -----------------
function scanQueryV2() {
  const folder = path.join(ROOT, "Query_V2");
  if (!fs.existsSync(folder)) return [];
  const arr = [];
  const entries = fs.readdirSync(folder);
  for (const f of entries) {
    const full = path.join(folder, f);
    if (!fs.statSync(full).isFile()) continue;
    if (path.extname(full).toLowerCase() === ".sql") {
      arr.push({ full, rel: path.relative(ROOT, full), size: fs.statSync(full).size, mtime: fs.statSync(full).mtimeMs });
    }
  }
  return arr;
}

// ----------------- parse package.json & .env -----------------
function readPackageJson() {
  const p = path.join(ROOT, "package.json");
  if (!fs.existsSync(p)) return null;
  try {
    const j = JSON.parse(fs.readFileSync(p, "utf8"));
    return j;
  } catch {
    return null;
  }
}

function readEnvFiles() {
  const candidates = [".env", ".env.local", ".env.production", ".env.development"];
  const env = {};
  for (const c of candidates) {
    const p = path.join(ROOT, c);
    if (!fs.existsSync(p)) continue;
    const txt = readSafe(p);
    txt.split(/\r?\n/).forEach(line => {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) {
        env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    });
  }
  return env;
}

// ----------------- simple SQL parser heuristics -----------------
function analyzeSQL(content) {
  const lower = content.toLowerCase();
  const res = {
    createTables: [],
    createViews: [],
    createFunctions: [],
    createTriggers: [],
    policies: [],
    enums: [],
  };

  // create table ... (capture name)
  let re = /create\s+table\s+(if\s+not\s+exists\s+)?("?[\w\.]+"?)/ig;
  let m;
  while ((m = re.exec(content))) {
    res.createTables.push(m[2].replace(/"/g, ""));
  }

  // create view
  re = /create\s+(or\s+replace\s+)?view\s+(if\s+not\s+exists\s+)?("?[\w\.]+"?)/ig;
  while ((m = re.exec(content))) {
    res.createViews.push(m[3].replace(/"/g, ""));
  }

  // create function
  re = /create\s+(or\s+replace\s+)?function\s+("?[\w\.]+"?)/ig;
  while ((m = re.exec(content))) {
    res.createFunctions.push(m[2].replace(/"/g, ""));
  }

  // create trigger
  re = /create\s+trigger\s+("?[\w\.]+"?)/ig;
  while ((m = re.exec(content))) {
    res.createTriggers.push(m[1].replace(/"/g, ""));
  }

  // create policy
  re = /create\s+policy\s+"?([^"\s]+)"?/ig;
  while ((m = re.exec(content))) {
    res.policies.push(m[1]);
  }

  // create type ... as enum
  re = /create\s+type\s+("?[\w\.]+"?)\s+as\s+enum/ig;
  while ((m = re.exec(content))) {
    res.enums.push(m[1].replace(/"/g, ""));
  }

  return res;
}

// ----------------- build manifest -----------------
function buildManifest(fileEntries, sqlEntries, pkg, env) {
  const manifest = {
    generatedAt: new Date().toISOString(),
    node: process.version,
    platform: os.platform(),
    summary: {
      totalFiles: fileEntries.length + sqlEntries.length,
      jsFiles: fileEntries.filter(f => [".js", ".jsx", ".ts", ".tsx"].includes(path.extname(f.full))).length,
      sqlFiles: sqlEntries.length,
    },
    tech: {},
    files: [],
    sql: [],
  };

  // tech stack from package.json & env
  if (pkg) {
    manifest.tech.name = pkg.name || "";
    manifest.tech.version = pkg.version || "";
    manifest.tech.dependencies = pkg.dependencies || {};
    manifest.tech.devDependencies = pkg.devDependencies || {};
    manifest.tech.scripts = pkg.scripts || {};
  }
  manifest.tech.env = {};
  // capture Supabase env keys and others
  for (const k of Object.keys(env)) {
    if (k.toLowerCase().includes("supabase") || k.toLowerCase().includes("vite_") || k.toLowerCase().includes("database") || k.toLowerCase().includes("db_")) {
      manifest.tech.env[k] = env[k];
    }
  }
  // quick supabase detection
  const deps = Object.assign({}, manifest.tech.dependencies || {}, manifest.tech.devDependencies || {});
  manifest.tech.usesSupabase = !!(deps["@supabase/supabase-js"] || Object.keys(manifest.tech.env).some(k => k.toLowerCase().includes("supabase")));

  // files metadata
  for (const fe of fileEntries) {
    const content = readSafe(fe.full);
    const ext = path.extname(fe.full).toLowerCase();
    const meta = {
      path: fe.rel,
      ext,
      size: fe.size,
      mtime: fe.mtime,
      lines: content.split(/\r?\n/).length,
      snippet: headLines(content, SNIPPET_LINES)
    };
    manifest.files.push(meta);
  }

  // sql metadata + deeper analysis
  for (const se of sqlEntries) {
    const txt = readSafe(se.full);
    const analysis = analyzeSQL(txt);
    manifest.sql.push({
      path: se.rel,
      size: se.size,
      mtime: se.mtime,
      lines: txt.split(/\r?\n/).length,
      snippet: headLines(txt, SNIPPET_LINES),
      analysis
    });
  }

  return manifest;
}

// ----------------- generate snippets (top N) -----------------
function generateSnippets(manifest, topN = DEFAULT_SNIPPETS) {
  // rank by importance: sql first, then files that mention booking/auth/admin
  const candidates = [];

  for (const s of manifest.sql) {
    candidates.push({ path: s.path, score: 1000 + s.lines, snippet: s.snippet });
  }
  for (const f of manifest.files) {
    let score = f.lines;
    const lower = (f.path + " " + f.snippet).toLowerCase();
    if (lower.includes("booking")) score += 200;
    if (lower.includes("auth") || lower.includes("sign")) score += 150;
    if (lower.includes("admin")) score += 120;
    if (lower.includes("supabase")) score += 180;
    candidates.push({ path: f.path, score, snippet: f.snippet });
  }

  candidates.sort((a, b) => b.score - a.score);
  const selected = candidates.slice(0, topN);

  const output = [];
  for (const s of selected) {
    const safeName = s.path.replace(/[\/\\]/g, "_").replace(/\s+/g, "_");
    const fn = path.join(SNIPPET_DIR, safeName + ".snippet.txt");
    fs.writeFileSync(fn, `// snippet: ${s.path}\n\n${s.snippet}`, "utf8");
    output.push({ original: s.path, snippetFile: path.relative(ROOT, fn) });
  }
  return output;
}

// ----------------- export full raw file (concatenate) -----------------
function exportRawFull(allFiles) {
  let out = `=====================================================\nFULL PROJECT RAW EXPORT\nGenerated: ${new Date().toISOString()}\n=====================================================\n\n`;
  for (const f of allFiles) {
    const rel = path.relative(ROOT, f.full || f);
    const content = readSafe(f.full || f);
    out += `\n=================================================================\nFILE PATH: ${rel}\n=================================================================\n${content}\n`;
  }
  fs.writeFileSync(RAW_OUTPUT, out, "utf8");
  console.log(`✔ Written RAW to ${RAW_OUTPUT}`);
}

// ----------------- write AI_PROJECT_STATE.txt (rich with TECH STACK + SQL summary) -----------------
function writeAIState(manifest, snippets) {
  const pkg = manifest.tech || {};
  const lines = [];
  lines.push("=====================================================");
  lines.push("AI PROJECT STATE (AIDO V5)");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("=====================================================");
  lines.push("");
  lines.push("PURPOSE: This file is the single source-of-truth to load project state into an AI assistant.");
  lines.push("");
  lines.push("STRICT RULES (MANDATORY):");
  lines.push("- DO NOT create any new files (.md/.txt/etc.) unless explicitly requested by user.");
  lines.push("- DO NOT restructure or rename files.");
  lines.push("- MODIFY only files explicitly requested.");
  lines.push("- Keep responses short and focused on the next task.");
  lines.push("- If you break these rules, STOP and ask the user.");
  lines.push("");
  lines.push("TECH STACK (AUTOMATICALLY EXTRACTED):");
  if (pkg.name) {
    lines.push(`Project: ${pkg.name} ${pkg.version ? `v${pkg.version}` : ""}`);
  }
  if (manifest.tech.dependencies) {
    const deps = manifest.tech.dependencies;
    const notable = [];
    if (deps["react"]) notable.push(`React ${deps["react"]}`);
    if (deps["@supabase/supabase-js"]) notable.push(`Supabase JS ${deps["@supabase/supabase-js"]}`);
    if (deps["vite"]) notable.push("Vite");
    if (deps["next"]) notable.push("Next.js");
    if (notable.length) lines.push("- " + notable.join(", "));
    else lines.push("- (Dependencies detected; see manifest.json)");
  } else {
    lines.push("- (No package.json found)");
  }
  lines.push("");
  lines.push("ENVIRONMENT / SUPABASE KEYS (partial, redacted):");
  const env = manifest.tech.env || {};
  for (const k of Object.keys(env)) {
    let v = env[k];
    if (k.toLowerCase().includes("key") || k.toLowerCase().includes("secret") || k.toLowerCase().includes("anon") ) {
      // redact but indicate presence
      lines.push(`- ${k}=<REDACTED>`);
    } else {
      lines.push(`- ${k}=${v}`);
    }
  }
  lines.push("");
  lines.push("DATABASE (Query_V2) SUMMARY:");
  if (manifest.sql && manifest.sql.length) {
    let totalTables = 0, totalFuncs = 0, totalPolicies = 0, enums = 0;
    for (const s of manifest.sql) {
      totalTables += (s.analysis.createTables || []).length;
      totalFuncs += (s.analysis.createFunctions || []).length;
      totalPolicies += (s.analysis.policies || []).length;
      enums += (s.analysis.enums || []).length;
    }
    lines.push(`- SQL Files: ${manifest.sql.length}`);
    lines.push(`- Tables detected across SQL: ${totalTables}`);
    lines.push(`- Functions detected: ${totalFuncs}`);
    lines.push(`- Policies detected: ${totalPolicies}`);
    lines.push(`- Enums detected: ${enums}`);
  } else {
    lines.push("- No Query_V2 SQL files found in manifest.");
  }
  lines.push("");
  lines.push("AUTO PROJECT METRICS:");
  lines.push(JSON.stringify(manifest.summary, null, 2));
  lines.push("");
  lines.push("TOP SNIPPETS INCLUDED (for compact AI payload):");
  for (const s of snippets) lines.push(`- ${s.original} => ${s.snippetFile}`);
  lines.push("");
  lines.push("NEXT DEVELOPMENT TASKS (initial recommendations):");
  lines.push("1) Improve Booking Calendar UI interaction.");
  lines.push("2) Implement Reservation Cancellation API.");
  lines.push("3) Enhance Admin Dashboard filtering & sorting.");
  lines.push("4) Add validation to Profile Settings form.");
  lines.push("5) Optimize Monthly Statistics SQL queries.");
  lines.push("");
  lines.push("USAGE (open a NEW AI tab and send these items):");
  lines.push("- .aido_out/manifest.json");
  lines.push("- .aido_out/snippets/*.snippet.txt (top N)");
  lines.push("- AI_PROJECT_STATE.txt");
  lines.push("");
  lines.push("INSTRUCTION (for AI):");
  lines.push("1) Load AI_PROJECT_STATE.txt and respond exactly: \"I have loaded the project state. Ready to continue development.\" (no extra text)");
  lines.push("2) Analyze manifest.json and update 'Global Completion' values (replace 'auto').");
  lines.push("3) Propose 1 prioritized small task and implement it as a minimal patch. Output only: commit message + unified diff.");
  lines.push("");
  lines.push("END OF STATE FILE.");

  fs.writeFileSync(STATE_OUTPUT, lines.join("\n"), "utf8");
  console.log(`✔ Written AI state to ${STATE_OUTPUT}`);
}

// ----------------- write manifest.json -----------------
function writeManifest(manifest) {
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`✔ Manifest written to ${MANIFEST_FILE}`);
}

// ----------------- main -----------------
function main() {
  console.log("⏳ Starting gop_code_V5 scan...");

  ensureOut();

  // scan repo files
  const fileEntries = scanDir(ROOT);
  const qv2 = scanQueryV2();
  // merge and dedupe by rel path
  const map = new Map();
  for (const f of fileEntries) map.set(f.rel, f);
  for (const s of qv2) map.set(s.rel, s);
  const all = Array.from(map.values());

  console.log(`Found ${all.length} allowed files (${qv2.length} SQL in Query_V2).`);

  // package & env
  const pkg = readPackageJson();
  const env = readEnvFiles();

  // build manifest
  const manifest = buildManifest(all, qv2, pkg, env);

  // generate snippets
  const snippets = generateSnippets(manifest, DEFAULT_SNIPPETS);

  // export raw concatenated (kept in .aido_out to avoid root noise)
  const rawInputs = all.map(i => ({ full: i.full }));
  exportRawFull(rawInputs);

  // write outputs
  writeManifest(manifest);
  writeAIState(manifest, snippets);

  console.log("\n🎉 gop_code_V5 finished. Outputs in .aido_out/ and AI_PROJECT_STATE.txt at repo root.");
}

main();
