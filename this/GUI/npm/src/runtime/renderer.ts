//src/runtime/renderer.ts
// this.GUI — runtime renderer
// Turns a small JSON-ish spec into React elements using a registry from window.GUI.
//
// Spec shape (minimal):
// {
//   type: string | React.ComponentType<any>,
//   props?: Record<string, any>,
//   children?: GuiNode | GuiNode[]
// }
// where GuiNode can also be a string/number/boolean/null.
/* eslint-disable @typescript-eslint/no-explicit-any */
export type GuiPrimitive = string | number | boolean | null | undefined;
export type GuiSpecNode = {
  type: string | any; // string key into registry OR a React component
  props?: Record<string, any>;
  children?: GuiNode | GuiNode[];
};

export type GuiNode = GuiPrimitive | GuiSpecNode | GuiNode[];
export type GuiRegistryLike = Record<string, any>;
export type ResolveResult = {
  Component: any | null;
  resolvedPath?: string;
};

export type RendererOptions = {
  /** React namespace (UMD: window.React). If omitted, will attempt globalThis.React. */
  React?: any;
  /** Base registry for string `type` lookups. If omitted, tries to infer from `gui`. */
  registry?: GuiRegistryLike;
  /** Optional: window.GUI (UMD surface). Used to infer registries. */
  gui?: any;
  /**
   * If true, unknown string types render as <div>Unknown: {type}</div>.
   * If false, unknown types return null.
   */
  showUnknown?: boolean;
  /** Optional transform hook to rewrite nodes before render (e.g., inject keys, normalize props). */
  transformNode?: (node: GuiSpecNode) => GuiSpecNode;
};

function getReact(opt?: RendererOptions): any {
  return opt?.React || (globalThis as any)?.React;
}

function isSpecNode(v: any): v is GuiSpecNode {
  return !!v && typeof v === 'object' && !Array.isArray(v) && 'type' in v;
}

function isPrimitive(v: any): v is GuiPrimitive {
  const t = typeof v;
  return v == null || t === 'string' || t === 'number' || t === 'boolean';
}

/**
 * Build a lookup registry from the GUI UMD surface.
 * Expected shape (single namespace, no `default` wrapper):
 * - root exports: GUI.Button, GUI.Layout, GUI.mount, ...
 * - registries: GUI.Atoms, GUI.Molecules, GUI.Components, GUI.Widgets
 * - lowercase aliases (optional): GUI.atoms / molecules / components / widgets / menus / hooks / contexts
 */
export function inferRegistryFromGUI(gui: any): GuiRegistryLike {
  const out: GuiRegistryLike = {};
  if (!gui || typeof gui !== 'object') return out;
  // 1) Root keys (prefer these first)
  for (const k of Object.keys(gui)) out[k] = gui[k];
  // 2) Capital registries
  const caps = ['Atoms', 'Molecules', 'Components', 'Widgets'] as const;
  for (const key of caps) {
    const reg = gui[key];
    if (reg && typeof reg === 'object') {
      for (const k of Object.keys(reg)) {
        // only fill gaps, root wins
        if (out[k] == null) out[k] = reg[k];
      }
    }
  }
  // 2.5) Root lowercase registries (UMD helpers)
  const lowers = ['atoms', 'molecules', 'components', 'widgets', 'theme', 'menus', 'hooks', 'contexts'] as const;
  for (const key of lowers) {
    const reg = gui[key];
    if (reg && typeof reg === 'object') {
      for (const k of Object.keys(reg)) {
        if (out[k] == null) out[k] = reg[k];
      }
    }
  }

  return out;
}

/**
 * Resolve a string type against:
 * - opt.registry
 * - inferred registry from opt.gui
 * - direct root GUI lookup
 */
export function resolveType(type: string, opt?: RendererOptions): ResolveResult {
  const gui = opt?.gui;
  const reg = opt?.registry; // prefer a precomputed registry

  // direct lookup
  if (reg && reg[type] != null) return { Component: reg[type], resolvedPath: `registry.${type}` };

  // allow dotted paths like "Atoms.Button" or "default.atoms.TextField" or "atoms.TextField"
  if (type.includes('.')) {
    const parts = type.split('.').filter(Boolean);

    // try through GUI first
    let cur: any = gui;
    for (const p of parts) {
      cur = cur?.[p];
      if (cur == null) break;
    }
    if (cur != null) return { Component: cur, resolvedPath: `GUI.${type}` };

    // then try through registry (in case someone passed a nested registry object)
    cur = reg;
    for (const p of parts) {
      cur = cur?.[p];
      if (cur == null) break;
    }
    if (cur != null) return { Component: cur, resolvedPath: `registry.${type}` };
  }

  // fallback root
  if (gui && gui[type] != null) return { Component: gui[type], resolvedPath: `GUI.${type}` };

  return { Component: null };
}

function normalizeChildren(children: any): any[] {
  if (children == null) return [];
  return Array.isArray(children) ? children : [children];
}

function withAutoKey(child: any, key: string): any {
  if (!isSpecNode(child)) return child;
  const props = child.props || {};
  if (props.key != null) return child;
  return { ...child, props: { ...props, key } };
}

/**
 * Render a GuiNode to a React element (or primitive) using React.createElement.
 */
export function renderNode(node: GuiNode, opt?: RendererOptions): any {
  const React = getReact(opt);
  if (!React) throw new Error('[this.GUI runtime] Missing React. Pass { React: window.React } in the renderer options.');

  // If caller provided gui but no registry, infer once and reuse for this call tree.
  // (This avoids recomputing inferRegistryFromGUI on every resolveType.)
  const nextOpt: RendererOptions = opt?.gui && !opt?.registry ? { ...opt, registry: inferRegistryFromGUI(opt.gui) } : (opt || {});

  // arrays (auto-key spec siblings)
  if (Array.isArray(node)) {
    return node.map((n, i) => renderNode(withAutoKey(n, `k${i}`), nextOpt));
  }

  // primitives
  if (isPrimitive(node)) return node as any;

  // spec
  if (isSpecNode(node)) {
    const next = nextOpt.transformNode ? nextOpt.transformNode(node) : node;
    const { type, props } = next;

    // children (auto-key spec siblings)
    const rawKids = normalizeChildren(next.children);
    const kids = rawKids.map((c, i) => renderNode(withAutoKey(c, `${typeof type === 'string' ? type : 'node'}-${i}`), nextOpt));

    // If `type` is already a React element, clone it (so spec can override props/children)
    if (React.isValidElement?.(type)) {
      return React.cloneElement(type, props ?? null, ...kids);
    }

    // ComponentType directly provided
    if (typeof type === 'function' || (typeof type === 'object' && type != null)) {
      return React.createElement(type, props ?? null, ...kids);
    }

    // string lookup
    if (typeof type === 'string') {
      const { Component } = resolveType(type, nextOpt);
      if (!Component) {
        if (nextOpt.showUnknown) {
          return React.createElement(
            'div',
            {
              style: {
                padding: 10,
                border: '1px dashed rgba(255,255,255,0.25)',
                borderRadius: 10,
                opacity: 0.9,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                fontSize: 12,
              },
            },
            `Unknown type: ${type}`
          );
        }
        return null;
      }
      return React.createElement(Component, props ?? null, ...kids);
    }
  }

  // unsupported
  return null;
}

/**
 * Convenience: render an entire spec tree with a GUI UMD surface.
 */
export function renderWithGUI(tree: GuiNode, gui: any, opt?: Omit<RendererOptions, 'gui'>): any {
  const registry = opt?.registry || inferRegistryFromGUI(gui);
  return renderNode(tree, { ...opt, gui, registry });
}

export default renderNode;
