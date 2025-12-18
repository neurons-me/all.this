import type { StorybookConfig } from '@storybook/react-vite';

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
    "@storybook/addon-themes"
  ],
  "framework": {
    "name": "@storybook/react-vite",
    "options": {}
  },
  previewHead: (head) => `
${head}
<script>
  // Provide global storySort in preview. (Manager still controls the sidebar UI behavior.)
  window.__STORYBOOK_ADDONS_CHANNEL__?.emit?.('setOptions', {
    storySort: {
      order: ['gui', 'components', 'atoms'],
    },
  });
</script>
`,
  // Attempt to make the sidebar tree start more collapsed.
  // NOTE: This is a manager UI hack (CSS selectors may change across SB versions).
  managerHead: (head) => `
${head}
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