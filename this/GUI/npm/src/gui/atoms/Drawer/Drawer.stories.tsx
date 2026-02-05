import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Drawer, Box, Button, Typography } from '@/gui/atoms';
// ======================= Meta =======================
const meta: Meta<typeof Drawer> = {
  title: 'Atoms/Containers/Drawer',
  component: Drawer,
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
The **Drawer** primitive is a thin wrapper over MUI's \`MuiDrawer\`. It preserves all of MUI's props and behavior, while keeping the import surface stable via \`@/gui/primitives\`.

---
## Features
- Variants: \`temporary\`, \`persistent\`, \`permanent\`.
- Anchors: \`left\`, \`right\`, \`top\`, \`bottom\`.
- Works with This.GUI theme (via the \`Theme\` provider).
- Accepts \`sx\` and \`PaperProps\` for styling the surface.

> Note: For \`temporary\` drawers, you control visibility with the \`open\` prop and \`onClose\`.  
> For \`permanent\` drawers, \`open\` is ignored by MUI; the drawer is always visible.

---
## Basic usage
~~~tsx
import { Drawer } from '@/gui/primitives';

<Drawer anchor="left" variant="temporary" open={open} onClose={() => setOpen(false)}>
  <div style={{ width: 260, padding: 16 }}>Content</div>
</Drawer>
~~~

## Permanent sidebar
~~~tsx
<Drawer anchor="left" variant="permanent" PaperProps={{ sx: { width: 260 } }}>
  <div style={{ width: 260, padding: 16 }}>Navigation</div>
</Drawer>
~~~

## Declarative JSON / Config
~~~json
{
  "type": "Drawer",
  "props": {
    "variant": "temporary",
    "anchor": "right",
    "PaperProps": { "sx": { "width": 300 } },
    "children": "<YourMenu />"
  }
}
~~~

When used via your registry/resolver, the object above is resolved into a live Drawer with the provided props.
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'radio' },
      options: ['temporary', 'persistent', 'permanent'],
    },
    anchor: {
      control: { type: 'radio' },
      options: ['left', 'right', 'top', 'bottom'],
    },
    open: {
      control: { type: 'boolean' },
      description: 'Only relevant for temporary/persistent variants.',
    },
    // Not useful as a control in SB; better shown in examples
    container: { table: { disable: true } },
  },
  args: {
    variant: 'temporary',
    anchor: 'left',
    open: false,
  },
};
export default meta;

type Story = StoryObj<typeof Drawer>;

// ======================= Helpers =======================
const DemoList = ({ label = 'Menu' }: { label?: string }) => (
  <Box sx={{ width: 260, p: 2 }}>
    <Typography variant="subtitle1" sx={{ mb: 1.5 }}>{label}</Typography>
    <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.9 }}>
      <li><a href="#">Item one</a></li>
      <li><a href="#">Item two</a></li>
      <li><a href="#">Item three</a></li>
    </ul>
  </Box>
);

// ======================= Stories =======================

export const Playground: Story = {
  render: (args) => (
    <>
      <Typography variant="body1" sx={{ mb: 1 }}>
        Toggle <strong>open</strong> in controls (temporary/persistent).
      </Typography>
      <Drawer {...args}>
        <DemoList />
      </Drawer>
    </>
  ),
};

export const TemporaryWithToggle: Story = {
  name: 'Temporary (with toggle button)',
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
          Open drawer
        </Button>
        <Drawer
          anchor="left"
          variant="temporary"
          open={open}
          onClose={() => setOpen(false)}
          ModalProps={{ keepMounted: true }}
        >
          <DemoList label="Temporary drawer" />
        </Drawer>
      </>
    );
  },
};

export const PermanentLeft: Story = {
  name: 'Permanent (left)',
  render: () => (
    <div style={{ display: 'flex', minHeight: 320 }}>
      <Drawer
        anchor="left"
        variant="permanent"
        PaperProps={{ sx: { width: 240, position: 'relative' } }}
      >
        <DemoList label="Permanent left" />
      </Drawer>
      <Box sx={{ flex: 1, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Content area</Typography>
        <Typography variant="body2">
          The permanent drawer is always visible and does not use the <code>open</code> prop.
        </Typography>
      </Box>
    </div>
  ),
};

export const RightAnchorTemporary: Story = {
  name: 'Temporary (right anchor)',
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button variant="outlined" onClick={() => setOpen(true)}>
          Open right drawer
        </Button>
        <Drawer
          anchor="right"
          variant="temporary"
          open={open}
          onClose={() => setOpen(false)}
          PaperProps={{ sx: { width: 300 } }}
        >
          <DemoList label="Right side" />
        </Drawer>
      </>
    );
  },
};

export const TopAndBottom: Story = {
  name: 'Top & bottom anchors',
  render: () => {
    const [openTop, setOpenTop] = React.useState(false);
    const [openBottom, setOpenBottom] = React.useState(false);
    return (
      <>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <Button variant="outlined" onClick={() => setOpenTop(true)}>Open top</Button>
          <Button variant="outlined" onClick={() => setOpenBottom(true)}>Open bottom</Button>
        </div>
        <Drawer
          anchor="top"
          variant="temporary"
          open={openTop}
          onClose={() => setOpenTop(false)}
          PaperProps={{ sx: { height: 200 } }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1">Top drawer</Typography>
          </Box>
        </Drawer>
        <Drawer
          anchor="bottom"
          variant="temporary"
          open={openBottom}
          onClose={() => setOpenBottom(false)}
          PaperProps={{ sx: { height: 200 } }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1">Bottom drawer</Typography>
          </Box>
        </Drawer>
      </>
    );
  },
};
