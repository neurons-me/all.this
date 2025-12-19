import type { StorybookConfig } from '@storybook/react-vite';
import tsconfigPaths from 'vite-tsconfig-paths';

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "staticDirs": [
    "../public"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
    "@storybook/addon-themes",
    "@storybook/addon-links",
  ],
  "framework": {
    "name": "@storybook/react-vite",
    "options": {}
  },
  viteFinal: async (viteConfig) => {
    viteConfig.plugins = viteConfig.plugins || [];
    viteConfig.plugins.push(tsconfigPaths());
    return viteConfig;
  },
  // Attempt to make the sidebar tree start more collapsed.
  // NOTE: This is a manager UI hack (CSS selectors may change across SB versions).
  managerHead: (head) => `
${head}
<link rel="stylesheet" href="/material-symbols.css" />
<style>
  /* Collapse groups by default in the left sidebar */
  [data-side="left"] [role="tree"] [role="group"] {
    display: none;
  }
  /* Keep the top-level list visible */
  [data-side="left"] [role="tree"] > [role="group"] {
    display: block;
  }
</style>
`,
  docs: { defaultName: 'Docs' },
  
};
export default config;
