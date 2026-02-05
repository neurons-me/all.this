// src/GUI.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import Theme from '@/gui/Theme/Theme';
import { QRouter } from '@/Router/Router';
import { GuiRegistry as CORE_REGISTRY, extendRegistry } from '@/Registry';
import type { GuiRegistry as GuiRegistryType } from '@/Registry/types';
export type GuiSpecNode = { type: string; props?: Record<string, any>; children?: any };
export type GUIProps = {
  title?: string;
  children?: React.ReactNode;
  /** Optional declarative spec to render (schema/AST). */
  spec?: GuiSpecNode | GuiSpecNode[];
  /** Optional extra resolvers to extend/override the core registry. */
  resolvers?: any[];
  /** Optional ctx passed to resolvers (handlers/actions/etc.). */
  ctx?: any;
};

let __GUI_REGISTRY__: GuiRegistryType = CORE_REGISTRY as unknown as GuiRegistryType;
export function installResolvers(entries: any[]) {
  if (!Array.isArray(entries) || !entries.length) return;
  __GUI_REGISTRY__ = extendRegistry(__GUI_REGISTRY__, entries);
}

function renderSpec(registry: GuiRegistryType, spec: any, ctx?: any): any {
  if (spec == null) return null;
  // Arrays are treated as fragments
  if (Array.isArray(spec)) {
    return (
      <>
        {spec.map((node, i) => (
          <React.Fragment key={i}>{renderSpec(registry, node, ctx)}</React.Fragment>
        ))}
      </>
    );
  }

  // Allow passing React nodes directly
  if (React.isValidElement(spec)) return spec;
  const type = (spec as any).type;
  const entry = type ? registry[type] : undefined;
  if (!entry) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(`[GUI] Unknown spec type: ${String(type)}`);
    }
    return null;
  }

  return entry.resolve(spec, ctx);
}

export function mountSpec(target: Element | string, spec: any, ctx?: any) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  const defaultSpec = { type: 'Home', props: {} };
  const finalSpec = (spec === undefined || spec === null) ? defaultSpec : spec;
  const mount = document.createElement('div');
  el.appendChild(mount);
  const reactRoot = ReactDOM.createRoot(mount);
  reactRoot.render(
    <Theme>
      <QRouter>
        {renderSpec(__GUI_REGISTRY__, finalSpec, ctx)}
      </QRouter>
    </Theme>
  );
  return () => {
    try {
      // best-effort unmount
      reactRoot.unmount();
    } catch {}
    mount.remove();
  };
}

export const GUI = ({ title = 'this.GUI', children, spec, resolvers, ctx }: GUIProps) => {
  if (resolvers && resolvers.length) installResolvers(resolvers);
  const fallbackSpec = { type: 'Home', props: {} };
  const content = spec ? renderSpec(__GUI_REGISTRY__, spec, ctx) : (children ?? renderSpec(__GUI_REGISTRY__, fallbackSpec, ctx));
  return (
    <Theme>
      <QRouter>
        <main style={{ padding: '2rem' }}>
          <h1>{title}</h1>
          {content ?? <p>Ready to render declarative GUI components.</p>}
        </main>
      </QRouter>
    </Theme>
  );
};

// ✅ Register as a Web Component for HTML usage
if (typeof window !== 'undefined' && !customElements.get('gui-app')) {
  customElements.define(
    'gui-app',
    class extends HTMLElement {
      connectedCallback() {
        const mount = document.createElement('div');
        this.appendChild(mount);
        const raw = this.getAttribute('spec');
        let parsed: any = undefined;
        if (raw) {
          try { parsed = JSON.parse(raw); } catch {}
        }
        ReactDOM.createRoot(mount).render(<GUI spec={parsed ?? { type: 'Home', props: {} }} />);
        console.log('[GUI] <gui-app> mounted');
      }
    }
  );
}

// ✅ Auto-bootstrap if loaded directly (e.g., via <script src="this.gui.umd.js">)
if (typeof window !== 'undefined') {
  (window as any).GUI = (window as any).GUI || {};
  (window as any).GUI.install = (entries: any[]) => installResolvers(entries);
  (window as any).GUI.mount = (selector: string, spec?: any, ctx?: any) => mountSpec(selector, spec, ctx);

  // Expose version on the global (UMD) surface
  const injectedVersion =
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    typeof __GUI_VERSION__ !== 'undefined' ? __GUI_VERSION__ : undefined;
  const v = injectedVersion || (typeof process !== 'undefined' ? process.env?.npm_package_version : undefined) || '0.0.0-dev';
  (window as any).GUI.version = v;
  (window as any).GUI.VERSION = v;

  window.addEventListener('DOMContentLoaded', () => {
    const rootTag = document.querySelector('gui-app');
    if (rootTag) return; // already handled by custom element
    const auto = document.getElementById('root');
    if (auto) {
      ReactDOM.createRoot(auto).render(<GUI />);
      console.log('[GUI] Auto-booted inside #root');
    }
  });
}
