import type { Meta, StoryObj } from '@storybook/react';
import { AppBar, Toolbar, Typography, Box, Button } from '@/gui/components/atoms';

// ======================= Meta =======================
const meta: Meta<typeof AppBar> = {
  title: 'Atoms/Containers/AppBar',
  component: AppBar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
        <div style={{ padding: 0, minHeight: 240 }}>
          <Story />
        </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
The **AppBar** atom is a thin wrapper around MUI's \`AppBar\` that keeps the original API while letting you style it with \`sx\` and use it declaratively through the **resolver**.

---
## Features
- Positions: \`fixed\`, \`absolute\`, \`sticky\`, \`static\`, \`relative\`.
- Colors: \`default\`, \`inherit\`, \`primary\`, \`secondary\`, \`transparent\`. AppBar **only supports** these colors for the \`color\` prop.
- Note: \`success\`, \`info\`, \`warning\`, and \`error\` are **not supported** by the \`color\` prop. Use \`sx={{ bgcolor: '...' }}\` for these colors.
- Additional theme colors can be applied via \`sx={{ bgcolor: 'success.main' }}\` etc.
- Elevation & dark-mode override with \`enableColorOnDark\`.
- Accepts any children (e.g., \`<Toolbar/>\`, actions, brand, etc.).
- Fully themeable via **This.GUI** tokens and \`sx\`.
- Variant semantic presets: \`mui\` (default) behaves like MUI AppBar, \`glass\` for floating blurred panel style.

---
## Key Props
- \`variant?: 'mui' | 'glass'\` — semantic preset.
- \`position?: 'fixed' | 'absolute' | 'sticky' | 'static' | 'relative'\`.
- \`color?: 'default' | 'inherit' | 'primary' | 'secondary' | 'transparent'\` — AppBar **only supports** these values.
- \`success\`, \`info\`, \`warning\`, and \`error\` are **not supported** by \`color\`; use \`sx={{ bgcolor: '...' }}\` instead.
- \`elevation?: number\`.
- \`enableColorOnDark?: boolean\`.
- \`sx?: object\` — granular styling via the system.

---
## Basic usage (React)
~~~tsx
import { AppBar, Toolbar, Typography, Button, Box } from '@/gui/atoms';

<AppBar position="fixed" color="default" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
  <Toolbar variant="dense">
    <Typography variant="h6" sx={{ flexGrow: 1 }}>My App</Typography>
    <Button variant="text">Login</Button>
  </Toolbar>
</AppBar>
~~~

---
## Declarative JSON / Config usage
This GUI's **resolver** lets you describe an app bar via a config object. Example payload for the \`AppBarResolver\`:

~~~json
{
  "type": "AppBar",
  "props": {
    "position": "fixed",
    "color": "default",
    "sx": { "borderBottom": "1px solid", "borderColor": "divider" },
    "children": {
      "type": "Toolbar",
      "props": {
        "variant": "dense",
        "children": [
          { "type": "Typography", "props": { "variant": "h6", "sx": { "flexGrow": 1 }, "children": "My App" } },
          { "type": "Button", "props": { "variant": "text", "children": "Login" } }
        ]
      }
    }
  }
}
~~~

> The resolver maps this spec to real React elements, preserving polymorphism and \`sx\` styling.
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['mui', 'glass'],
      description: 'Semantic preset. mui (default): behaves like MUI AppBar. glass: floating blurred panel style.',
    },
    position: {
      control: { type: 'select' },
      options: ['fixed', 'absolute', 'sticky', 'static', 'relative'],
    },
    color: {
      control: { type: 'select' },
      options: ['default', 'inherit', 'primary', 'secondary', 'transparent'],
    },
    elevation: { control: { type: 'number' } },
    enableColorOnDark: { control: { type: 'boolean' } },
    // component polymorphism is supported but not exposed as a control in SB
    component: { table: { disable: true } },
  },
  args: {
    variant: undefined,
    position: 'fixed',
    elevation: 0,
    enableColorOnDark: false,
    sx: { borderBottom: '1px solid', borderColor: 'divider' },
  },
};
export default meta;

type Story = StoryObj<typeof AppBar>;

// ======================= Stories =======================
export const Playground: Story = {
  render: (args) => (
    <AppBar {...args}>
      <Toolbar variant="dense">
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Playground</Typography>
        <Button variant="text">Action</Button>
      </Toolbar>
    </AppBar>
  ),
};

export const Positions: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 16 }}>
      {(['fixed', 'absolute', 'sticky', 'static', 'relative'] as const).map((pos) => (
        <AppBar key={pos} {...args} position={pos}>
          <Toolbar variant="dense">
            <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
              position = {pos}
            </Typography>
            <Button variant="text">Action</Button>
          </Toolbar>
        </AppBar>
      ))}
    </div>
  ),
};

export const Colors: Story = {
  parameters: {
    docs: {
      description: {
        story: `
The AppBar component only supports the following values for the \`color\` prop: \`default\`, \`inherit\`, \`primary\`, \`secondary\`, and \`transparent\`.
For colors like \`success\`, \`info\`, \`warning\`, and \`error\`, use the \`sx\` prop with \`bgcolor\` instead, e.g. \`sx={{ bgcolor: 'success.main' }}\`.
        `,
      },
    },
  },
  args: { position: 'static' },
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      {(['default', 'inherit', 'primary', 'secondary', 'transparent'] as const).map((c) => (
        <AppBar key={c} {...args} color={c}>
          <Toolbar variant="dense">
            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>color = {c}</Typography>
            <Button variant="text">Action</Button>
          </Toolbar>
        </AppBar>
      ))}
    </div>
  ),
};

/**
 * The AppBar component does not support 'success', 'info', 'warning', or 'error' as values for the color prop.
 * To use these colors, apply them via the sx prop with bgcolor instead.
 */
export const CustomColorsWithSx: Story = {
  args: { position: 'static' },
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      {(['success.main', 'info.main', 'warning.main', 'error.main'] as const).map((bgcolor) => (
        <AppBar key={bgcolor} {...args} sx={{ bgcolor }}>
          <Toolbar variant="dense">
            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>{`sx.bgcolor = ${bgcolor}`}</Typography>
            <Button variant="text">Action</Button>
          </Toolbar>
        </AppBar>
      ))}
    </div>
  ),
};

export const WithToolbar: Story = {
  args: { position: 'static', color: 'default' },
  render: (args) => (
    <AppBar {...args} sx={{ px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar variant="dense">
        <Typography variant="h6" sx={{ flexGrow: 1 }}>With Toolbar</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="text">Login</Button>
          <Button variant="contained" color="primary">Sign up</Button>
        </Box>
      </Toolbar>
    </AppBar>
  ),
};

export const Elevation: Story = {
  args: { position: 'static', color: 'default' },
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      {[0, 1, 2, 4, 8].map((elev) => (
        <AppBar key={elev} {...args} elevation={elev}>
          <Toolbar variant="dense">
            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>elevation = {elev}</Typography>
            <Button variant="text">Action</Button>
          </Toolbar>
        </AppBar>
      ))}
    </div>
  ),
};

export const EnableColorOnDark: Story = {
  args: { position: 'static', color: 'primary', enableColorOnDark: true },
  render: (args) => (
    <AppBar {...args}>
      <Toolbar variant="dense">
        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>enableColorOnDark = true</Typography>
        <Button variant="text">Action</Button>
      </Toolbar>
    </AppBar>
  ),
};

export const Variants: Story = {
  args: { position: 'static', color: 'default', variant: undefined },
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      {(['mui', 'glass'] as const).map((v) => (
        <AppBar key={v} {...args} variant={v as any}>
          <Toolbar variant="dense">
            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
              variant = {v}
            </Typography>
            <Button variant="text">Action</Button>
          </Toolbar>
        </AppBar>
      ))}
    </div>
  ),
};