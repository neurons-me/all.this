#!/usr/bin/env node

/**
 * This.GUI CLI (ESM version)
 *
 * Usage:
 *   npx this.gui my-app
 *
 * This runs in native ESM mode.
 */

import { execSync } from "node:child_process";
import fsExtra from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(`This.GUI CLI
Usage:
  npx this.gui <project-name>

Examples:
  npx this.gui my-app
`);
  process.exit(0);
}
const appName = args[0] || "my-app";
const distTemplateDir = path.resolve(__dirname, "../../init");
const srcTemplateDir = path.resolve(__dirname, "../init");
const templateDir = fsExtra.existsSync(distTemplateDir)
  ? distTemplateDir
  : srcTemplateDir;
const targetDir = path.resolve(process.cwd(), appName);
console.log(`\n🧩 Creating .GUI: ${appName}\n`);
try {
  if (!fsExtra.existsSync(templateDir)) {
    throw new Error(`init directory not found at: ${templateDir}`);
  }
  fsExtra.copySync(templateDir, targetDir);
  console.log(`📁 Project files copied to ${targetDir}`);
  process.chdir(targetDir);
  console.log(`📦 Installing dependencies...\n`);
  execSync("npm install", { stdio: "inherit" });
  console.log(`\n✅ Done!\n`);
  console.log(`Next steps:\n  cd ${appName}\n  npm run dev\n`);
} catch (error) {
  console.error("❌ Error creating project:", error);
  process.exit(1);
}
