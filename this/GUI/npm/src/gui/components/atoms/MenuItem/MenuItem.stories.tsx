import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import MenuItem from './MenuItem';
import Menu from '@/gui/atoms/Menu/Menu';
import Button from '@mui/material/Button';
import Icon from '@/gui/Theme/Icon/Icon';
const meta: Meta<typeof MenuItem> = {
  title: 'Atoms/Navigation/MenuItem',
  component: MenuItem,
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
The **MenuItem** atom is a thin wrapper around MUI's \`MuiMenuItem\`.

In **declarative** mode (registry), the resolver supports:
- \`label\` / \`secondary\` → maps to \`<ListItemText primary/secondary />\`
- \`startIcon\` → token (e.g., \`"mui:Settings"\`, \`"lucide:mail"\`) or React node → renders inside \`<ListItemIcon />\`
- Granular styling via:
  - \`sx\` (root)
  - \`iconSx\` (ListItemIcon)
  - \`textSx\` (ListItemText)

---
## Declarative JSON / Resolver
~~~json
{
  "type": "MenuItem",
  "props": {
    "startIcon": "mui:Settings",
    "label": "Settings",
    "secondary": "Manage your preferences",
    "sx": { "py": 1 },
    "iconSx": { "minWidth": 36 },
    "textSx": { "my": 0 }
  }
}
~~~
        `,
      },
    },
    controls: {
      exclude: ['component'],
    },
  },
  argTypes: {
    dense: { control: 'boolean' },
    divider: { control: 'boolean' },
    disabled: { control: 'boolean' },
    selected: { control: 'boolean' },
    sx: { control: 'object' },
  },
  args: {
    dense: false,
    divider: false,
    disabled: false,
    selected: false,
    sx: {},
    children: 'Menu item',
  },
};

export default meta;
type Story = StoryObj<typeof MenuItem>;

// Reusable demo wrapper that controls open/close
const DemoMenu: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  return (
    <>
      <Button variant="outlined" onClick={handleOpen} data-testid="open-menu">
        Open Menu
      </Button>
      <Menu open={open} anchorEl={anchorEl} onClose={handleClose} onClick={handleClose}>
        {children ?? (
          <>
            <MenuItem onClick={handleClose}>Profile</MenuItem>
            <MenuItem onClick={handleClose} selected dense>
              <Icon name="settings" weight={400} fill={0} style={{ marginRight: 8 }} />
              Settings
            </MenuItem>
            <MenuItem onClick={handleClose} disabled>
              Disabled
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
};

// ======================= Stories =======================
export const Playground: Story = {
  render: (args) => (
    <DemoMenu>
      <MenuItem {...args} />
    </DemoMenu>
  ),
};

export const States: Story = {
  render: () => (
    <DemoMenu>
      <MenuItem>Default</MenuItem>
      <MenuItem selected>Selected</MenuItem>
      <MenuItem disabled>Disabled</MenuItem>
      <MenuItem dense>Dense</MenuItem>
    </DemoMenu>
  ),
};

export const WithCustomChildren: Story = {
  render: () => (
    <DemoMenu>
      <MenuItem>
        <strong>Custom node as children</strong>
      </MenuItem>
      <MenuItem>
        <span style={{ opacity: 0.75 }}>With inline styling</span>
      </MenuItem>
    </DemoMenu>
  ),
};
