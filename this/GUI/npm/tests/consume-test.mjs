import assert from "assert";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

function log(message) {
  console.log(`${GREEN}✓${RESET} ${message}`);
}

function error(message) {
  console.error(`${RED}✗${RESET} ${message}`);
}

async function runTest(name, testFn) {
  try {
    await testFn();
    log(name);
  } catch (e) {
    error(name);
    console.error(e);
    process.exit(1);
  }
}

// Test 1: Import dist/this.gui.es.js and validate minimal keys
runTest("Test 1: Core bundle exports", async () => {
  const coreBundle = await import(path.resolve(__dirname, "../dist/this.gui.es.js"));
  assert.ok(coreBundle.default, "Default export should exist");
  assert.ok(coreBundle.default.version, "Version should be exported");
  assert.ok(coreBundle.default.Theme, "Theme should be exported");
  assert.ok(coreBundle.default.atoms, "atoms should be exported");
});

// Test 2: Consume without react-router-dom
runTest("Test 2: Consumption without react-router-dom", async () => {
  const tempDir = path.resolve(__dirname, "temp-consumer");
  fs.mkdirSync(tempDir, { recursive: true });
  fs.writeFileSync(
    path.join(tempDir, "package.json"),
    JSON.stringify({
      name: "temp-consumer",
      version: "1.0.0",
      type: "module",
      dependencies: {
        "this.gui": `file:${path.resolve(__dirname, "..")}`,
      },
    })
  );

  execSync("npm install", { cwd: tempDir, stdio: "inherit" });

  const testFile = `
    import GUI from "this.gui";
    import assert from "assert";

    assert.ok(GUI.version, "Version should be accessible");
    assert.ok(GUI.Theme, "Theme should be accessible");
    assert.ok(!GUI.QRouter, "QRouter should not be accessible in core bundle");
  `;
  fs.writeFileSync(path.join(tempDir, "test.mjs"), testFile);

  execSync("node test.mjs", { cwd: tempDir, stdio: "inherit" });

  fs.rmSync(tempDir, { recursive: true, force: true });
});

// Test 3: Consume with react-router-dom
runTest("Test 3: Consumption of router subpath", async () => {
  const tempDir = path.resolve(__dirname, "temp-consumer-with-router");
  fs.mkdirSync(tempDir, { recursive: true });
  fs.writeFileSync(
    path.join(tempDir, "package.json"),
    JSON.stringify({
      name: "temp-consumer-with-router",
      version: "1.0.0",
      type: "module",
      dependencies: {
        "this.gui": `file:${path.resolve(__dirname, "..")}`,
        "react-router-dom": "6",
      },
    })
  );

  execSync("npm install", { cwd: tempDir, stdio: "inherit" });

  const testFile = `
    import { QRouter } from "this.gui/router";
    import assert from "assert";

    assert.ok(QRouter, "QRouter should be importable from subpath");
  `;
  fs.writeFileSync(path.join(tempDir, "test.mjs"), testFile);

  execSync("node test.mjs", { cwd: tempDir, stdio: "inherit" });

  fs.rmSync(tempDir, { recursive: true, force: true });
});
