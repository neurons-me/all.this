import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ListItemButton from './ListItemButton';
import ListItemIcon from '@/gui/atoms/ListItemIcon/ListItemIcon';
import ListItemText from '@/gui/atoms/ListItemText/ListItemText';
import Icon from '@/gui/Theme/Icon/Icon';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

const meta: Meta<typeof ListItemButton> = {
  title: 'Atoms/Organization/ListItemButton',
  component: ListItemButton,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
        <div style={{ padding: 16, minHeight: 260, maxWidth: 560 }}>
          <Story />
        </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
The **ListItemButton** atom is a thin wrapper around MUI's \`MuiListItemButton\`, staying faithful to its API and polymorphism.

In **declarative** mode, the resolver adds sugar:
- \`startIcon\` / \`endIcon\`: token (e.g., \`"lucide:mail"\`, \`"mui:settings"\`) or ReactNode — rendered via the icon registry
- \`label\` / \`secondary\` → mapped to \`<ListItemText primary/secondary />\`
- Granular styling:
  - \`sx\` (root), \`iconSx\` (leading \`ListItemIcon\`), \`textSx\` (text), \`endIconSx\` (trailing icon container)

---
## React usage
~~~jsx
<List>
  <ListItem disablePadding>
    <ListItemButton selected>
      <ListItemIcon>
        <Icon name="lucide:mail" />
      </ListItemIcon>
      <ListItemText primary="Inbox" secondary="Messages" />
    </ListItemButton>
  </ListItem>
</List>
~~~

## Declarative JSON / Resolver
~~~json
{
  "type": "ListItemButton",
  "props": {
    "startIcon": "lucide:mail",
    "label": "Inbox",
    "secondary": "Messages",
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
      exclude: ['component', 'children'],
    },
  },
  argTypes: {
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
    dense: { control: 'boolean' },
    divider: { control: 'boolean' },
    alignItems: { control: { type: 'radio' }, options: ['center', 'flex-start'] },
    sx: { control: 'object' },
  },
  args: {
    selected: false,
    disabled: false,
    dense: false,
    divider: false,
    alignItems: 'center',
    sx: {},
    children: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof ListItemButton>;

const DemoList: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
    <ListItem disablePadding>{children}</ListItem>
  </List>
);

// ======================= Stories =======================
export const Playground: Story = {
  render: (args) => (
    <DemoList>
      <ListItemButton {...args}>
        <ListItemIcon>
          <Icon name="mail" />
        </ListItemIcon>
        <ListItemText primary="Inbox" secondary="Messages" />
      </ListItemButton>
    </DemoList>
  ),
};

export const WithTrailingIcon: Story = {
  render: () => (
    <DemoList>
      <ListItemButton>
        <ListItemIcon>
          <Icon name="settings" />
        </ListItemIcon>
        <ListItemText primary="Settings" secondary="Preferences" />
        <span style={{ marginLeft: 'auto', display: 'inline-flex' }}>
          <Icon name="chevron_right" />
        </span>
      </ListItemButton>
    </DemoList>
  ),
};

export const AsAnchorLink: Story = {
  render: () => (
    <DemoList>
      <ListItemButton component="a" href="https://neurons.me">
        <ListItemIcon>
          <Icon name="link" />
        </ListItemIcon>
        <ListItemText primary="neurons.me" secondary="External link" />
      </ListItemButton>
    </DemoList>
  ),
};

export const WithSx: Story = {
  render: () => (
    <DemoList>
      <ListItemButton sx={{ py: 1.25 }}>
        <ListItemIcon sx={{ minWidth: 40 }}>
          <Icon name="person" />
        </ListItemIcon>
        <ListItemText
          primary="Profile"
          secondary="Account"
          slotProps={{ secondary: { sx: { color: 'text.secondary' } } }}
        />
      </ListItemButton>
    </DemoList>
  ),
};
