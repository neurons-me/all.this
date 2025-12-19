import type { Meta, StoryObj } from '@storybook/react';
import Grid from './Grid';
import Box from '@/gui/atoms/Box/Box';

// ======================= Meta =======================
const meta: Meta<typeof Grid> = {
  title: 'Atoms/Containers/Grid',
  component: Grid,
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
The **Grid** atom is a thin wrapper around MUI's \`Grid\` component. It keeps the original API and polymorphism but integrates with **This.GUI** tokens and allows declarative usage via the resolver.

---
## Features
- Supports all MUI Grid props like \`container\`, \`item\`, \`spacing\`, \`xs\`, \`sm\`, \`md\`, etc.
- Fully themeable via **This.GUI** tokens and \`sx\`.
- Works both as a container and as an item.
- Can be described declaratively via JSON specs for resolvers.

---
## Key Props
- \`container?: boolean\` — defines a grid container.
- \`item?: boolean\` — defines a grid item.
- \`spacing?: number | object\` — gap between items (when container).
- \`xs | sm | md | lg | xl?: number\` — responsive column sizes.
- \`sx?: object\` — granular styling.

---
## Basic usage (React)
~~~tsx
import { Grid, Box } from '@/gui/atoms';

<Grid container spacing={2}>
  <Grid item xs={6}>
    <Box sx={{ backgroundColor: 'primary.main', p: 2, color: '#fff' }}>Item 1</Box>
  </Grid>
  <Grid item xs={6}>
    <Box sx={{ backgroundColor: 'secondary.main', p: 2, color: '#fff' }}>Item 2</Box>
  </Grid>
</Grid>
~~~

---
## Declarative JSON / Config usage
This GUI's **resolver** lets you describe a Grid via a config object:

~~~json
{
  "type": "Grid",
  "props": {
    "container": true,
    "spacing": 2,
    "children": [
      {
        "type": "Grid",
        "props": {
          "item": true,
          "xs": 6,
          "children": {
            "type": "Box",
            "props": {
              "sx": { "backgroundColor": "primary.main", "p": 2, "color": "#fff" },
              "children": "Item 1"
            }
          }
        }
      },
      {
        "type": "Grid",
        "props": {
          "item": true,
          "xs": 6,
          "children": {
            "type": "Box",
            "props": {
              "sx": { "backgroundColor": "secondary.main", "p": 2, "color": "#fff" },
              "children": "Item 2"
            }
          }
        }
      }
    ]
  }
}
~~~

> The resolver maps this spec to real React elements, preserving polymorphism and \`sx\` styling.
        `,
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Grid>;

// ======================= Stories =======================
export const Playground: Story = {
  render: (args) => (
    <Grid {...args} container spacing={2}>
      <Grid item xs={6}>
        <Box sx={{ backgroundColor: 'primary.main', p: 2, color: '#fff' }}>Item 1</Box>
      </Grid>
      <Grid item xs={6}>
        <Box sx={{ backgroundColor: 'secondary.main', p: 2, color: '#fff' }}>Item 2</Box>
      </Grid>
    </Grid>
  ),
};

export const ResponsiveGrid: Story = {
  render: (args) => (
    <Grid {...args} container spacing={2}>
      <Grid item xs={12} sm={6} md={4}>
        <Box sx={{ backgroundColor: 'info.main', p: 2, color: '#fff' }}>xs=12 sm=6 md=4</Box>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Box sx={{ backgroundColor: 'success.main', p: 2, color: '#fff' }}>xs=12 sm=6 md=4</Box>
      </Grid>
      <Grid item xs={12} sm={12} md={4}>
        <Box sx={{ backgroundColor: 'warning.main', p: 2, color: '#fff' }}>xs=12 sm=12 md=4</Box>
      </Grid>
    </Grid>
  ),
  name: 'Responsive Grid Layout',
};