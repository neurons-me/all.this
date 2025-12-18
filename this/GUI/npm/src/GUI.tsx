// src/GUI.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GuiProvider } from '../index';
import { QRouter } from '@/QRouter/QRouter';

export const GUI = ({ title = 'this.GUI', children }: { title?: string; children?: React.ReactNode }) => {
  return (
    <GuiProvider>
      <QRouter>
        <main style={{ padding: '2rem' }}>
          <h1>{title}</h1>
          {children ?? <p>Ready to render declarative GUI components.</p>}
        </main>
      </QRouter>
    </GuiProvider>
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
        ReactDOM.createRoot(mount).render(<GUI />);
        console.log('[GUI] <gui-app> mounted');
      }
    }
  );
}

// ✅ Auto-bootstrap if loaded directly (e.g., via <script src="this.gui.umd.js">)
if (typeof window !== 'undefined') {
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