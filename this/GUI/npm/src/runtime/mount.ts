//src/runtime/mount.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { GuiNode, RendererOptions } from './renderer';
import { renderWithGUI } from './renderer';

export type MountTarget = string | Element;

// Cache React roots by host element so repeated `mount()` calls update instead of re-creating roots.
// Use a WeakMap to avoid memory leaks when elements are removed.
const ROOTS_KEY = '__THIS_GUI_RUNTIME_ROOTS__';

type ReactRoot = {
  render: (el: any) => void;
  unmount: () => void;
};

function getRootCache(): WeakMap<Element, ReactRoot> {
  const g = globalThis as any;
  if (!g[ROOTS_KEY]) g[ROOTS_KEY] = new WeakMap<Element, ReactRoot>();
  return g[ROOTS_KEY] as WeakMap<Element, ReactRoot>;
}

function resolveTarget(target: MountTarget): Element {
  if (typeof target === 'string') {
    const el = document.querySelector(target);
    if (!el) throw new Error(`[this.GUI] mount target not found: ${target}`);
    return el;
  }
  return target;
}

function getReactGlobals(opt?: any) {
  const g = globalThis as any;
  return {
    gui: opt?.gui ?? g.GUI,
    React: opt?.React ?? g.React,
    ReactDOM: opt?.ReactDOM ?? g.ReactDOM,
  };
}

/**
 * Mount (or update) a GUI tree into a DOM host.
 * - Repeated calls with the same host element will *update* the existing React root.
 * - Returns a handle with `root` and `unmount()`.
 */
export function mount(
  tree: GuiNode,
  target: MountTarget,
  opt?: Omit<RendererOptions, 'gui'> & { gui?: any; React?: any; ReactDOM?: any }
) {
  const { gui, React, ReactDOM } = getReactGlobals(opt);

  if (!gui) throw new Error('[this.GUI] Missing window.GUI (UMD surface).');
  if (!React) throw new Error('[this.GUI] Missing window.React.');
  if (!ReactDOM?.createRoot) throw new Error('[this.GUI] Missing ReactDOM.createRoot.');

  const host = resolveTarget(target);
  const cache = getRootCache();

  let root = cache.get(host);
  if (!root) {
    root = ReactDOM.createRoot(host) as ReactRoot;
    cache.set(host, root);
  }

  let el = renderWithGUI(tree, gui, { ...opt, React });

  // Some components rely on `useInsetsContext`, which requires an `InsetsProvider` above.
  // In UMD mode we try to discover providers from the exposed `window.GUI` surface.
  const InsetsProvider =
    (gui && (gui.InsetsProvider || gui.insetsProvider)) ||
    (gui?.Contexts && (gui.Contexts.InsetsProvider || gui.Contexts.insetsProvider)) ||
    (gui?.contexts && (gui.contexts.InsetsProvider || gui.contexts.insetsProvider)) ||
    (gui?.Theme && (gui.Theme.InsetsProvider || gui.Theme.insetsProvider)) ||
    (gui?.theme && (gui.theme.InsetsProvider || gui.theme.insetsProvider));

  // If your GUI has a top-level theme/provider (common in this.GUI), wrap with it as well.
  const ThemeProvider =
    gui?.Theme ||
    gui?.theme?.Theme ||
    (gui?.Theme && gui.Theme.Theme);

  if (InsetsProvider) {
    el = React.createElement(InsetsProvider as any, null, el);
  }
  if (ThemeProvider) {
    el = React.createElement(ThemeProvider as any, null, el);
  }

  root.render(el);

  return {
    root,
    host,
    unmount: () => {
      try {
        root?.unmount?.();
      } finally {
        // Ensure future mounts recreate a fresh root.
        cache.delete(host);
      }
    },
  };
}
