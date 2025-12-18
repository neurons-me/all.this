import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Menu from './Menu';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';

const meta: Meta<typeof Menu> = {
  title: 'Atoms/Navigation/Menu',
  component: Menu,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
        <div style={{ padding: 16, minHeight: 260 }}>
          <Story />
        </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
The **Menu** atom is a thin wrapper around MUI's \`MuiMenu\`. It supports **granular styling** via:
- \`sx\` — root popover/menu container
- \`paperSx\` — Paper slot
- \`listSx\` — MenuList slot

You can also pass \`PaperProps\` and \`MenuListProps\`; their \`sx\` are **merged** with \`paperSx\`/\`listSx\`.

---
## Basic usage
~~~jsx
const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
const open = Boolean(anchorEl);

<Button onClick={(e) => setAnchorEl(e.currentTarget)}>Open menu</Button>
<Menu open={open} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}>
  <MenuItem onClick={() => setAnchorEl(null)}>Profile</MenuItem>
  <MenuItem onClick={() => setAnchorEl(null)}>Settings</MenuItem>
</Menu>
~~~

## Granular styling
~~~jsx
<Menu
  open={open}
  anchorEl={anchorEl}
  onClose={handleClose}
  sx={{ mt: 1 }}
  paperSx={{ borderRadius: 10 }}
  listSx={{ py: 0.5 }}
  PaperProps={{ elevation: 3 }}
/>
~~~

## Declarative JSON / Resolver
~~~json
{
  "type": "Menu",
  "props": {
    "open": true,
    "sx": { "mt": 1 },
    "paperSx": { "borderRadius": 10 },
    "listSx": { "py": 0.5 },
    "PaperProps": { "elevation": 3 },
    "children": [
      { "type": "MenuItem", "props": { "children": "Profile" } },
      { "type": "MenuItem", "props": { "children": "Settings" } }
    ]
  }
}
~~~

*Note:* \`anchorEl\` is a runtime element reference and is typically provided by the renderer/context in declarative mode.
        `,
      },
    },
    controls: {
      exclude: ['anchorEl', 'PaperProps', 'MenuListProps'],
    },
  },
  argTypes: {
    open: { control: 'boolean' },
    keepMounted: { control: 'boolean' },
    variant: { control: { type: 'radio' }, options: ['menu', 'selectedMenu'] },
    elevation: { control: { type: 'number', min: 0, max: 24, step: 1 } },
    sx: { control: 'object' },
  },
  args: {
    open: false, // controlled within each story with local state
    keepMounted: false,
    variant: 'menu',
    elevation: 1,
    sx: {},
    children: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof Menu>;

// Reusable demo component that owns anchor state but forwards args
const DemoMenu: React.FC<React.ComponentProps<typeof Menu>> = (props) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  return (
    <>
      <Button variant="outlined" onClick={handleOpen} data-testid="open-menu">
        Open Menu
      </Button>
      <Menu
        {...props}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        onClick={handleClose}
      >
        {props.children ?? (
          <>
            <MenuItem onClick={handleClose}>Profile</MenuItem>
            <MenuItem onClick={handleClose}>My account</MenuItem>
            <MenuItem onClick={handleClose}>Logout</MenuItem>
          </>
        )}
      </Menu>
    </>
  );
};

// ======================= Stories =======================
export const Playground: Story = {
  render: (args) => <DemoMenu {...args} />,
};

export const WithPaperAndListSx: Story = {
  args: {
    sx: { mt: 1 },
  },
  render: (args) => (
    <DemoMenu
      {...args}
      PaperProps={{ elevation: 2, sx: { borderRadius: 2 } }}
      MenuListProps={{ sx: { py: 0.5 } }}
    />
  ),
};

export const KeepMounted: Story = {
  args: { keepMounted: true },
  render: (args) => <DemoMenu {...args} />,
};

export const CustomOrigins: Story = {
  args: {
    sx: { mt: 1 },
    // Showcase custom anchor/transform origins
    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
    transformOrigin: { vertical: 'top', horizontal: 'left' },
  },
  render: (args) => <DemoMenu {...args} />,
};