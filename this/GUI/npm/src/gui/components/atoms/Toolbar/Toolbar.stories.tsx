import type { Meta, StoryObj } from '@storybook/react';
// Atoms used in the examples
import { Toolbar, AppBar, Box, IconButton, Typography, Button } from '@/gui/components/atoms';
import Icon from '@/gui/Theme/Icon/Icon';

// ======================= Meta =======================
const meta: Meta<typeof Toolbar> = {
  title: 'Atoms/Containers/Toolbar',
  component: Toolbar,
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
The **Toolbar** atom is a thin wrapper over MUI's \`MuiToolbar\`.

> **Not polymorphic.** Unlike \`Button\` or \`Box\`, **Toolbar does not accept** a \`component\` prop in MUI. If you need a different semantic element (e.g. \`<header>\`), wrap it with \`<Box component="header">\`.

---
## Features
- Density via \`variant\`: \`'regular'\` | \`'dense'\`.
- Optional gutters removal with \`disableGutters\`.
- Full **\`sx\`** support for styling.
- Plays nicely inside **AppBar** and custom layouts.

---
## Key Props
- \`variant?: 'regular' | 'dense'\`
- \`disableGutters?: boolean\`
- \`sx?: SxProps\` — theme-aware styling.

---
## Basic usage
~~~tsx
import { Toolbar } from '@/gui/atoms';

<Toolbar>
  <span>Left content</span>
</Toolbar>
~~~

## In an AppBar
~~~tsx
import { AppBar, Toolbar, Typography } from '@/gui/atoms';

<AppBar position="static">
  <Toolbar>
    <Typography variant="h6">Title</Typography>
  </Toolbar>
</AppBar>
~~~

## Change semantic element with Box
~~~tsx
import { Box, Toolbar } from '@/gui/atoms';

<Box component="header">
  <Toolbar variant="dense">Compact header</Toolbar>
</Box>
~~~
        `,
      },
    },
    controls: {
      exclude: ['component']
    },
  },
  argTypes: {
    variant: {
      control: { type: 'radio' },
      options: ['regular', 'dense'],
    },
    disableGutters: { control: 'boolean' },
    // Toolbar is not polymorphic in MUI, so hide any notion of `component`
  },
  args: {
    variant: 'regular',
    disableGutters: false,
    children: (
      <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 12 }}>
        <strong>Toolbar content</strong>
      </div>
    ),
  },
};
export default meta;

type Story = StoryObj<typeof Toolbar>;

// ======================= Stories =======================
export const Playground: Story = {};

export const DenseVsRegular: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <Toolbar>
        <Typography variant="body2">Regular Toolbar</Typography>
      </Toolbar>
      <Toolbar variant="dense">
        <Typography variant="body2">Dense Toolbar</Typography>
      </Toolbar>
    </div>
  ),
};

export const WithActions: Story = {
  render: () => (
    <Toolbar sx={{ display: 'flex', gap: 8 }}>
      <Typography sx={{ flex: 1 }} variant="h6">Title</Typography>
      <IconButton aria-label="search">
        <Icon name="search" fontSize={20} />
      </IconButton>
      <IconButton aria-label="user">
        <Icon name="person" fontSize={20} />
      </IconButton>
      <Button variant="contained" size="small">Action</Button>
    </Toolbar>
  ),
};

export const InAppBar: Story = {
  render: () => (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flex: 1 }}>App Bar + Toolbar</Typography>
        <Button color="inherit" size="small">Login</Button>
      </Toolbar>
    </AppBar>
  ),
};

export const WrappedInHeader: Story = {
  render: () => (
    <Box component="header" sx={{ border: '1px solid', borderColor: 'divider' }}>
      <Toolbar variant="dense">
        <Typography variant="body2">Header Toolbar (wrapped by Box)</Typography>
      </Toolbar>
    </Box>
  ),
};

export const WithCustomSx: Story = {
  render: () => (
    <Toolbar sx={{ bgcolor: 'background.paper', border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
      <Typography variant="body2">Styled with sx</Typography>
    </Toolbar>
  ),
};