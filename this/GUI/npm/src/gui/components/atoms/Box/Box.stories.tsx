// src/gui/atoms/Box/Box.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Link, Typography, Button } from '@/gui/components/atoms';
// ======================= Meta =======================
const meta: Meta<typeof Box> = {
  title: 'Atoms/Containers/Box',
  component: Box,
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
**Box** is a thin wrapper around MUI's \`Box\` that preserves **polymorphism** and integrates with **This.GUI** theming.
Use it as your default layout primitive: spacing, flex/grid, backgrounds, borders, etc.

---
## Features
- **Polymorphic**: \`component\` (or \`as\`) can be an element tag (e.g. \`'section'\`, \`'img'\`, \`'a'\`) or a component (e.g. This.GUI \`Link\`).
- **Routing-friendly**: when using \`component={Link}\` you can pass \`to\`; anchors use \`href\`.
- **System props** & **sx**: use MUI system (p, m, display, gap, flex, grid, etc.) and the \`sx\` prop for deep styling.
- **Image mode**: if \`component="img"\`, you can pass \`src\`, \`alt\`, \`width\`, \`height\`, \`loading\`, \`decoding\`, \`referrerPolicy\`, \`sizes\`, \`srcSet\`.

---
## Key Props
- \`component?: ElementType | string\` / \`as?: ElementType | string\`
- \`to?: string\` (when \`component={Link}\`)
- \`href?: string\` (when \`component="a"\`)
- \`sx?: SxProps\` + all MUI system props (e.g. \`p\`, \`m\`, \`display\`, \`gap\`)
- **Image-only extras** (when \`component="img"\`): \`src\`, \`alt\`, \`width\`, \`height\`, \`loading\`, \`decoding\`, \`referrerPolicy\`, \`sizes\`, \`srcSet\`.

> We don't expose \`component\`, \`to\`, \`href\` as Storybook controls—see the dedicated stories below.

---
## Basic usage
~~~jsx
import { Box } from '@/gui/atoms';

<Box p={2} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
  Content
</Box>
~~~

## Polymorphic (as a section)
~~~jsx
<Box component="section" p={2}>Section content</Box>
~~~

## Router link target
~~~jsx
import { Box, Link } from '@/gui/atoms';

<Box component={Link} to="/docs" p={1} sx={{ display: 'inline-block' }}>
  Go to docs
</Box>
~~~

## Image mode
~~~jsx
<Box component="img" src="/logo.png" alt="Logo" sx={{ width: 120, height: 'auto' }} />
~~~

## Declarative JSON / Config usage
~~~json
{
  "type": "Box",
  "props": {
    "component": "section",
    "p": 2,
    "sx": { "border": "1px solid", "borderColor": "divider", "borderRadius": 8 },
    "children": "Section content"
  }
}
~~~
        `,
      },
    },
    controls: {
      exclude: ['component', 'as', 'to', 'href', 'sx'],
    },
  },
  argTypes: {
    // System props examples (you can add more if useful)
    p: { control: { type: 'number' }, description: 'Padding (system prop)' },
    m: { control: { type: 'number' }, description: 'Margin (system prop)' },
    display: {
      control: { type: 'select' },
      options: ['block', 'inline-block', 'flex', 'grid', 'inline-flex', 'inline', 'none'],
    },
    gap: { control: { type: 'number' } },
  },
  args: {
    p: 2,
    display: 'block',
    children: 'Box content',
  },
};
export default meta;

type Story = StoryObj<typeof Box>;

// ======================= Stories =======================
export const Playground: Story = {};

export const LayoutBasics: Story = {
  name: 'Layout basics (spacing, border, radius)',
  render: (args) => (
    <Box
      {...args}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    />
  ),
};

export const FlexRow: Story = {
  args: {},
  render: () => (
    <Box display="flex" gap={2}>
      <Box p={1} sx={{ border: '1px dashed', borderColor: 'divider' }}>A</Box>
      <Box p={1} sx={{ border: '1px dashed', borderColor: 'divider' }}>B</Box>
      <Box p={1} sx={{ border: '1px dashed', borderColor: 'divider' }}>C</Box>
    </Box>
  ),
};

export const GridLayout: Story = {
  render: () => (
    <Box display="grid" sx={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Box key={i} p={2} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          Cell {i + 1}
        </Box>
      ))}
    </Box>
  ),
};

export const AsSection: Story = {
  name: 'Polymorphic: section',
  render: () => (
    <Box component="section" p={2} sx={{ borderLeft: '4px solid', borderColor: 'primary.main' }}>
      <Typography variant="h6">Section title</Typography>
      <Typography variant="body2" sx={{ opacity: 0.8 }}>
        Section content goes here.
      </Typography>
    </Box>
  ),
};

export const AsAnchor: Story = {
  name: 'Polymorphic: anchor (href)',
  render: () => (
    <Box
      component="a"
      href="https://neurons.me"
      target="_blank"
      rel="noreferrer"
      p={1}
      sx={{
        display: 'inline-block',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        '&:hover': { textDecoration: 'none', bgcolor: 'action.hover' },
      }}
    >
      Visit neurons.me
    </Box>
  ),
};

export const AsRouterLink: Story = {
  name: 'Polymorphic: Link (to)',
  render: () => (
    <Box
      component={Link}
      to="/docs"
      p={1}
      sx={{
        display: 'inline-block',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        '&:hover': { textDecoration: 'none', bgcolor: 'action.hover' },
      }}
    >
      Go to docs
    </Box>
  ),
};

export const ImageMode: Story = {
  name: 'Image mode (component="img")',
  render: () => (
    <Box
      component="img"
      src="https://placekitten.com/320/160"
      alt="Kitten"
      sx={{ width: 320, height: 'auto', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
      loading="lazy"
      decoding="async"
    />
  ),
};

export const NestedComposition: Story = {
  render: () => (
    <Box p={2} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Nested composition</Typography>
      <Box display="flex" gap={1}>
        <Button variant="contained" color="primary">Action</Button>
        <Box component={Link} to="/docs" sx={{ alignSelf: 'center' }}>
          Learn more
        </Box>
      </Box>
    </Box>
  ),
};

export const SXDeepStyling: Story = {
  name: 'Deep styling with sx',
  render: () => (
    <Box
      p={2}
      sx={{
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        '& .demo-title': {
          fontWeight: 700,
          color: 'text.primary',
          mb: 1,
        },
        '& .demo-card': {
          p: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          '&:hover': { bgcolor: 'action.hover' },
        },
      }}
    >
      <Typography className="demo-title">Cards</Typography>
      <Box display="grid" sx={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
        <Box className="demo-card">One</Box>
        <Box className="demo-card">Two</Box>
        <Box className="demo-card">Three</Box>
      </Box>
    </Box>
  ),
};