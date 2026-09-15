// browser.ts — all.this's browser-safe facade.
//
// Re-exports ONLY the public entry points of the modules that are actually
// safe to load in a browser (no `fs`/`child_process`/process-spawning
// logic): the .me kernel client, cleaker's namespace grammar, and the GUI
// runtime. Deliberately does NOT re-export monad.ai or netget here — both
// are Node.js servers (Express, process management, filesystem) and have
// no browser-safe build; importing this file must never pull them in.
//
// Importing this file must have NO side effects: no server starts, no UI
// mounts, no service installs. It only exposes names — using them (e.g.
// calling GUI.bootstrap(), or new ME(seed)) is the caller's own explicit
// action.
export * as me from "this.me";
export * as cleaker from "cleaker";
export * as gui from "this.gui";
// The tree-shakeable root ("this.gui") deliberately excludes the
// interpreter (renderNode, AppShell, mount, GuiRegistry) -- that lives
// under the separate "./runtime" subpath by GUI's own design (see
// runtime-entry.ts). A spec-driven app needs THIS, not the root.
export * as guiRuntime from "this.gui/runtime";
// RuntimeInspector, SelectionProvider/useSelection, and the selectionStore
// singleton they all read live under this separate "./devtools" subpath
// (devtools-entry.ts) -- not "./runtime", which only tags rendered nodes
// with data-gui-node-id but never registers them anywhere on its own. An
// app that wants the semantic Inspector (spec vs resolved props, kernel
// explain/lineage, click-to-select) needs this too.
export * as guiDevtools from "this.gui/devtools";
// CleakerLanding (the real, already-tested ".me" identity landing page —
// register/sign-in/recover, QR, keychain, users/blockchain directories) and
// MeLauncher (the compact sign-in bubble, same underlying session) live
// under this separate "./react" subpath (react-entry.ts) -- neither is in
// the tree-shakeable root. An app that wants to mount the real identity
// entry point (not reinvent a second one) needs this.
export * as guiReact from "this.gui/react";
// getActiveNamespaceRoot()/setActiveNamespaceRoot() — the globalThis-keyed
// "which root am I claiming/signing into right now" singleton
// CleakerLandingHome and MeLauncher's credentials branch both read (see
// this.gui's own signedRequest.ts) -- a caller composing MeLauncher outside
// CleakerLanding (which normally sets this itself) needs to set it too, or
// loginWithCredentials()/registerWithCredentials() fall through to
// fetchGatewayHostname() (a real gateway's /me/gateway route) and fail on
// any host that isn't actually served by one, disposable demos included.
export * as guiCleaker from "this.gui/cleaker";
