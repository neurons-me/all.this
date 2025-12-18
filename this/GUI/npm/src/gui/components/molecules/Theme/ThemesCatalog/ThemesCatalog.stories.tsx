import type { Meta, StoryObj } from '@storybook/react';
import ThemesCatalog from './ThemesCatalog';

// ======================= Meta =======================
const meta: Meta<typeof ThemesCatalog> = {
  title: 'Theme/ThemesCatalog',
  component: ThemesCatalog,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ padding: 16, minHeight: 320 }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
The **ThemesCatalog** component renders a visual interface to explore and select available GUI themes for your application.

It fetches all theme configurations from the \`getGuiThemes()\` utility and displays them using a visually rich card interface. You can toggle between **grid** and **list** layouts and switch between light/dark previews per theme. When a theme is selected, it is applied globally via the context provided by \`useThemeContext()\`.

---
## Features
- Visual layout for theme browsing.
- Switch between **grid** and **list** variants.
- Light/dark mode preview toggle.
- Swatches preview for key palette values: \`primary\`, \`secondary\`, and \`background\`.
- Selectable themes that apply across your GUI via context.
- JSON-compatible configuration for declarative UI building.
- Fully themed with **This.GUI** primitives.

---
## Props
- \`variant?: 'grid' | 'list'\` — controls layout format. Defaults to \`grid\`.
- \`sx?: SxProps\` — accepts style overrides via MUI’s \`sx\` prop.

---
## Basic Usage
~~~jsx
<ThemesCatalog variant="grid" />
<ThemesCatalog variant="list" />
~~~

## Declarative JSON Configuration
~~~json
{
  "type": "ThemesCatalog",
  "props": {
    "variant": "list"
  }
}
~~~

This component is ideal for apps that allow users to select their visual theme from a set of predefined theme options. It pairs well with This.GUI’s theme management context and is useful in both developer-facing configuration tools and end-user customization interfaces.
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'radio' },
      options: ['grid', 'list'],
      description: 'Choose layout variant',
    },
  },
  args: {
    variant: 'grid',
  },
};

export default meta;
type Story = StoryObj<typeof ThemesCatalog>;

// ======================= Stories =======================
export const Playground: Story = {
  args: {
    variant: 'grid',
  },
};

export const ListVariant: Story = {
  name: 'List layout',
  args: {
    variant: 'list',
  },
};