// server.ts — all.this's server-side facade.
//
// Re-exports the public entry points of every module, including the
// Node.js-only servers (monad.ai, netget) that browser.ts deliberately
// excludes. Same contract as browser.ts: importing this file must have
// NO side effects — no monad process starts, no OpenResty config gets
// touched, no gateway installs. Starting anything is always a separate,
// explicit call the caller makes after importing.
//
// Deliberately NOT re-exporting this.gui here: nothing in monad.ai's or
// netget's own server-side code imports it as a JS module today — both
// only reference its compiled dist as a static-file PATH to serve to the
// browser (guiPkgDistDir), never as executed code. this.gui's dist is
// also packaged for a bundler (deep imports like `@mui/material/Box`
// that resolve to a directory), not for a raw Node ESM import — it
// belongs in browser.ts, where it's actually meant to run.
export * as me from "this.me";
export * as cleaker from "cleaker";
export * as monad from "monad.ai";
export * as netget from "netget";
