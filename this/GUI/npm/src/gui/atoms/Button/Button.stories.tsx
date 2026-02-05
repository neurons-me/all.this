import type { Meta, StoryObj } from '@storybook/react';
import { Button, Link } from '@/gui/atoms';
import Icon from '@/gui/Theme/Icon/Icon';

// ======================= Meta =======================
const meta: Meta<typeof Button> = {
  title: 'Atoms/Forms & Inputs/Button',
  component: Button,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
        <div style={{ padding: 16, minHeight: 240 }}>
          <Story />
        </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
The **Button** primitive is a thin wrapper around MUI's \`MuiButton\` that preserves **polymorphism** and adds **declarative icons** (string tokens like 
\`mui:Send\` or \`lucide:bolt\`). It integrates with **This.GUI** theming and respects your token-built palette.

---
## Features
- Variants: \`contained\`, \`outlined\`, \`text\`.
- Colors: \`primary\`, \`secondary\`, \`success\`, \`info\`, \`warning\`, \`error\`, \`inherit\`.
- Sizes: \`small\`, \`medium\`, \`large\`.
- **Icons** via tokens (\`startIcon\` / \`endIcon\`) or React nodes.
- **Polymorphic**: \`component\` can be \`'a'\` or a Link (e.g. the This.GUI wrapper \`Link\`) for routing.
- Respects your theme from \`Theme\` (no need to wrap with \`ThemeProvider\`).

---
## Key Props
- \`startIcon?: string | ReactNode\` — accepts a name from the **icon registry** (\`mui:*\` / \`lucide:*\`) or a React element.
- \`endIcon?: string | ReactNode\`.
- \`component?: ElementType | string\` — for polymorphism (\`'a'\`, RouterLink, etc.).
- \`href?: string\` — when \`component='a'\`.
- \`to?: string\` — when \`component={Link}\`.

> Note: \`to\` and \`href\` are not exposed as Storybook controls because they only apply in specific modes; they are shown in dedicated stories.

---
## Basic usage
~~~jsx
import { Button } from '@/gui/primitives';

<Button variant="contained" color="primary">Save</Button>
<Button variant="outlined" color="secondary">Cancel</Button>
<Button variant="text">Learn more</Button>
~~~

## With declarative icons
~~~jsx
<Button variant="contained" color="secondary" startIcon="mui:Send" endIcon="lucide:bolt">
  Send
</Button>
~~~

## As native anchor link
~~~jsx
<Button component="a" href="https://neurons.me" /* target="_blank" rel="noreferrer" */>
  Visit neurons.me
</Button>
~~~

## With RouterLink (This.GUI Link)
~~~jsx
import { Button, Link } from '@/gui/primitives';

<Button component={Link} to="/docs">Go to docs</Button>
~~~
## Declarative JSON / Config usage
~~~json
{
  "type": "Button",
  "props": {
    "variant": "text",
    "color": "primary",
    "component": "a",
    "href": "https://neurons.me",
    "target": "_blank",
    "rel": "noreferrer",
    "children": "Visit neurons.me"
  }
}
~~~

Another example with a RouterLink:
~~~json
{
  "type": "Button",
  "props": {
    "variant": "contained",
    "color": "secondary",
    "component": "Link",
    "to": "/docs",
    "startIcon": "mui:Send",
    "children": "Go to docs"
  }
}
~~~
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'radio' },
      options: ['contained', 'outlined', 'text'],
    },
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'inherit'],
    },
    size: {
      control: { type: 'radio' },
      options: ['small', 'medium', 'large'],
    },
    startIcon: { control: 'text', description: 'Icon token or a React element.' },
    endIcon: { control: 'text', description: 'Icon token or a React element.' },
    onClick: { action: 'clicked' },
  },
  args: {
    variant: 'contained',
    color: 'primary',
    size: 'medium',
    children: 'Click me',
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

// ======================= Stories =======================
export const Playground: Story = {};

export const Variants: Story = {
  args: { color: 'primary' },
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Button {...args} variant="contained">Contained</Button>
      <Button {...args} variant="outlined">Outlined</Button>
      <Button {...args} variant="text">Text</Button>
    </div>
  ),
};

export const Colors: Story = {
  args: { variant: 'contained' },
  render: (args) => {
    const colors: Array<'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error'> =
      ['primary', 'secondary', 'success', 'info', 'warning', 'error'];
    return (
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {colors.map((c) => (
          <Button key={c} {...args} color={c}>
            {c[0].toUpperCase() + c.slice(1)}
          </Button>
        ))}
      </div>
    );
  },
};

export const Sizes: Story = {
  args: { color: 'primary', variant: 'contained' },
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button {...args} size="small">Small</Button>
      <Button {...args} size="medium">Medium</Button>
      <Button {...args} size="large">Large</Button>
    </div>
  ),
};

export const WithIcons: Story = {
  args: {
    variant: 'contained',
    color: 'secondary',
    startIcon: <Icon name="Power" />,
    endIcon: <Icon name="bolt" />,
    children: 'Send',
  },
};

export const PolymorphicAnchor: Story = {
  args: {
    variant: 'text',
    color: 'primary',
    children: 'Go to neurons.me',
  },
  render: (args) => (
    <Button component="a" href="https://neurons.me">
      {args.children}
    </Button>
  ),
};

export const PolymorphicRouterLink: Story = {
  args: {
    variant: 'text',
    color: 'primary',
    children: 'Go to /docs',
  },
  render: (args) => (
    <Button component={Link} to="/docs">
      {args.children}
    </Button>
  ),
};

export const Disabled: Story = {
  args: { variant: 'contained', color: 'primary', disabled: true, children: 'Disabled' },
};

export const FullWidth: Story = {
  args: { variant: 'contained', color: 'primary', fullWidth: true, children: 'Full Width' },
};
