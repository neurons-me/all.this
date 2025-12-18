/// <reference types="vitest/config" />
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import { resolve } from 'path';
import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));
// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
const isDemo = process.env.DEMO === 'true';
const isStorybook = process.env.STORYBOOK === 'true';
export default defineConfig({
  plugins: [
    ...(isStorybook ? [] : [mdx({ include: ['**/*.mdx', '**/*.md'] })]),
    // Use the automatic JSX runtime so components don't need `import React`.
    // Storybook renders source TSX directly, so forcing the classic runtime causes
    // `ReferenceError: React is not defined` in any component that only imports hooks.
    react({ jsxRuntime: 'automatic' })
  ],
  resolve: {
    alias: {
      '@/gui/atoms': resolve(__dirname, 'src/gui/components/atoms'),
      '@/gui/molecules': resolve(__dirname, 'src/gui/components/molecules'),
      '@/gui/organisms': resolve(__dirname, 'src/gui/components/organisms'),
      '@/gui/components': resolve(__dirname, 'src/gui/components'),
      '@': resolve(__dirname, 'src'),
    },
    dedupe: ['react', 'react-dom', 'react-router-dom']
  },
  build: isDemo ? undefined : {
    lib: {
      entry: {
        index: resolve(__dirname, 'index.ts'),
        atoms: resolve(__dirname, 'src/gui/components/atoms/index.ts'),
      },
      name: 'GUI',
      fileName: (format, entryName) => {
        const name = entryName === 'index' ? 'this.gui' : entryName;
        if (format === 'cjs') return `${name}.cjs`;
        return `${name}.${format}.js`;
      },
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: (id) => {
        // IMPORTANT:
        // - Keep React and ReactDOM external (peer deps)
        // - Keep the automatic JSX runtime helpers external as well (they ship with React).
        const externalIds = new Set([
          'react',
          'react-dom',
          'react-router',
          'react-router-dom',
          'fs',
          'path',
          'url',
          'child_process',
          'fs-extra',
          'react-dom/client',
          'react/jsx-runtime',
          'react/jsx-dev-runtime',
        ]);

        return externalIds.has(id);
      },
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-router-dom': 'ReactRouterDOM',
          'react-dom/client': 'ReactDOM',
          'react/jsx-runtime': 'ReactJSXRuntime',
          'react/jsx-dev-runtime': 'ReactJSXRuntime',
        },
        exports: 'named',
        banner: '/* this.GUI — Neurons.me embeddable UI system */',
      },
    }
  },
  optimizeDeps: isStorybook ? {} : {
    include: ['@uiw/react-md-editor', '@uiw/react-markdown-preview']
  },
  root: isDemo ? resolve(__dirname, 'demo') : '.',
  publicDir: isDemo ? resolve(__dirname, 'demo/public') : 'public',
  server: isDemo ? {
    open: true
  } : false,
  test: {
    projects: [{
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: 'playwright',
          instances: [{
            browser: 'chromium'
          }]
        },
        setupFiles: ['.storybook/vitest.setup.js']
      }
    }]
  }
});

const CLI_DIST_PATH = resolve(__dirname, 'dist/bin/cli.js');

async function ensureNodeShebang(filePath) {
  const contents = await fsp.readFile(filePath, 'utf8');
  const shebang = '#!/usr/bin/env node';
  const hasShebang = contents.startsWith(shebang);

  let normalized = contents.replace(/\r\n/g, '\n');
  if (hasShebang) {
    const lines = normalized.split('\n');
    let index = 0;
    while (lines[index] === shebang) index += 1;
    normalized = [shebang, ...lines.slice(index)].join('\n');
  } else {
    normalized = `${shebang}\n${normalized}`;
  }

  if (normalized !== contents) await fsp.writeFile(filePath, normalized, 'utf8');
}

// Post-process CLI after tsc build
async function buildCLI() {
  if (!fs.existsSync(CLI_DIST_PATH)) {
    throw new Error(
      `Could not find CLI entry at "${CLI_DIST_PATH}". ` +
        `Make sure "tsc --project tsconfig.cli.json" ran successfully.`,
    );
  }

  await ensureNodeShebang(CLI_DIST_PATH);

  // Ensure it's executable when packed/published.
  // (No-op on platforms where chmod is unsupported.)
  try {
    await fsp.chmod(CLI_DIST_PATH, 0o755);
  } catch {
    // ignore
  }
}

// Hook to run CLI build after Vite build
export async function buildFinished() {
  await buildCLI();
}
