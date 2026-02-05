#!/usr/bin/env node

/**
 * This.GUI CLI (ESM version)
 *
 * Usage:
 *   npx this.gui my-app
 *
 * Notes:
 *   - The generated app includes Storybook by default.
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
  npx this.gui <dir> --html
  npx this.gui --html

Flags:
  --html   Generate a plain HTML runtime with a basic GUI.mount() (no Vite, no Storybook)

What you get:
  - Vite + React app pre-wired with this.gui
  - Storybook included by default

Docs:
  https://neurons-me.github.io/GUI/

Examples:
  npx this.gui my-app

Next:
  cd <project-name>
  npm run dev
  npm run storybook
`);
  process.exit(0);
}
const appName = args[0] || "my-app";
const wantsHtml = args.includes("--html");
// If the first arg is a flag (starts with -) and --html is used, write into CWD.
const firstArg = args[0];
const htmlDirName = firstArg && !firstArg.startsWith("-") ? firstArg : ".";
const htmlTargetDir = path.resolve(process.cwd(), htmlDirName);
const htmlOutPath = path.join(htmlTargetDir, "index.html");
const htmlTemplate = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>this.GUI — Minimal Mount</title>
  </head>
  <body>
    <div id="root"></div>
    <!-- React globals (required by the this.GUI UMD bundle) -->
    <script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js" crossorigin="anonymous"></script>
    <!-- If the bundle checks process.env.NODE_ENV, avoid ReferenceError in the browser -->
    <script>
      window.process = window.process || { env: { NODE_ENV: 'production' } };
    </script>
    <!-- this.GUI UMD (exposes window.GUI) -->
    <script src="https://cdn.jsdelivr.net/npm/this.gui@latest/dist/this.gui.umd.js" crossorigin="anonymous"></script>
    <!-- Minimal mount via GUI.mount (spec + optional ctx) -->
    <script>
      (function () {
        const GUI = window.GUI;
        if (!GUI) {
          document.body.innerHTML = '<pre style="padding:16px">Missing window.GUI (this.gui.umd.js not loaded)</pre>';
          return;
        }
        if (typeof GUI.mount !== 'function') {
          document.body.innerHTML = '<pre style="padding:16px">window.GUI.mount is not available in this build</pre>';
          return;
        }

        // Start your declarative tree here:
        const spec = { type: 'Home', props: {} };
        const ctx = {};
        GUI.mount('#root', spec, ctx);
        console.log('[this.GUI] mounted via GUI.mount');
      })();
    </script>
  </body>
</html>
`;
const distTemplateDir = path.resolve(__dirname, "../../init");
const srcTemplateDir = path.resolve(__dirname, "../init");
const templateDir = fsExtra.existsSync(distTemplateDir)
  ? distTemplateDir
  : srcTemplateDir;
const targetDir = path.resolve(process.cwd(), appName);
console.log(`
      ▗▄▄▖▗▖ ▗▖▗▄▄▄▖
     ▐▌   ▐▌ ▐▌  █  
     ▐▌▝▜▌▐▌ ▐▌  █  
this.▝▚▄▞▘▝▚▄▞▘▗▄█▄▖
🧩 Creating: ${wantsHtml ? `HTML runtime (${htmlDirName})` : appName}`);
try {
  if (wantsHtml) {
    fsExtra.ensureDirSync(htmlTargetDir);
    fsExtra.writeFileSync(htmlOutPath, htmlTemplate, "utf8");
    console.log(`\n🧩 this.GUI HTML runtime created:`);
    console.log(`📄 ${htmlOutPath}\n`);
    console.log(`Next steps:\n  - Open index.html in a browser (or serve the folder)\n  - Edit the spec in the script tag to build your GUI tree\n`);
    process.exit(0);
  }

  if (!fsExtra.existsSync(templateDir)) {
    throw new Error(`init directory not found at: ${templateDir}`);
  }
  fsExtra.copySync(templateDir, targetDir);
  console.log(`📁 Project @ ${targetDir}`);
  process.chdir(targetDir);
  console.log(`✅ Success!\n`);
  console.log(
    `Next steps:\n  cd ${appName}\n  npm install\n  npm run dev\n\nStorybook:\n  npm run storybook\n  # or: npm run build-storybook\n\nDocs:\n  https://neurons-me.github.io/GUI/\n`
  );
} catch (error) {
  console.error("❌ Error creating project:", error);
  process.exit(1);
}
