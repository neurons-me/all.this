import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ListItem from './ListItem';
import List from '@mui/material/List';
import ListItemIcon from '@/gui/atoms/ListItemIcon/ListItemIcon';
import ListItemText from '@/gui/atoms/ListItemText/ListItemText';
import Icon from '@/gui/Theme/Icon/Icon';
const meta: Meta<typeof ListItem> = {
  title: 'Atoms/Organization/ListItem',
  component: ListItem,
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
The **ListItem** atom is a thin wrapper around MUI's \`MuiListItem\`, staying faithful to its API and polymorphism.
In **declarative** mode (resolver), it simply forwards MUI props and allows granular styling via \`sx\`.

---

## React usage
~~~jsx
<List dense>
  <ListItem divider>
    <ListItemIcon>
      <Icon name="lucide:inbox" />
    </ListItemIcon>
    <ListItemText primary="Inbox" secondary="Messages" />
  </ListItem>
</List>
~~~

## Declarative JSON / Resolver
~~~json
{
  "type": "ListItem",
  "props": {
    "dense": true,
    "divider": true,
    "selected": true,
    "sx": { "py": 1 }
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
    dense: { control: 'boolean' },
    divider: { control: 'boolean' },
    disableGutters: { control: 'boolean' },
    alignItems: { control: { type: 'radio' }, options: ['center', 'flex-start'] },
    sx: { control: 'object' },
  },
  args: {
    dense: false,
    divider: false,
    disableGutters: false,
    alignItems: 'center',
    sx: {},
    children: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof ListItem>;

const DemoList: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
    {children}
  </List>
);

// ======================= Stories =======================
export const Playground: Story = {
  render: (args) => (
    <DemoList>
      <ListItem {...args}>
        <ListItemIcon>
          <Icon name="lucide:inbox" />
        </ListItemIcon>
        <ListItemText primary="Inbox" secondary="Messages" />
      </ListItem>
    </DemoList>
  ),
};

export const Variants: Story = {
  render: () => (
    <DemoList>
      <ListItem>
        <ListItemIcon>
          <Icon name="lucide:mail" />
        </ListItemIcon>
        <ListItemText primary="Default" secondary="No props" />
      </ListItem>
      <ListItem dense>
        <ListItemIcon>
          <Icon name="lucide:mail" />
        </ListItemIcon>
        <ListItemText primary="Dense" />
      </ListItem>
      <ListItem divider>
        <ListItemIcon>
          <Icon name="lucide:mail" />
        </ListItemIcon>
        <ListItemText primary="With divider" />
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <Icon name="lucide:mail" />
        </ListItemIcon>
        <ListItemText primary="Default (no selected on ListItem)" />
      </ListItem>
      <ListItem alignItems="flex-start">
        <ListItemIcon>
          <Icon name="lucide:mail" />
        </ListItemIcon>
        <ListItemText primary="Align start" secondary="Secondary text that wraps onto multiple lines for demo." />
      </ListItem>
    </DemoList>
  ),
};

export const WithSx: Story = {
  render: () => (
    <DemoList>
      <ListItem sx={{ py: 1.25, '&:hover': { bgcolor: 'action.hover' } }}>
        <ListItemIcon sx={{ minWidth: 40 }}>
          <Icon name="lucide:user" />
        </ListItemIcon>
        <ListItemText
          primary="Profile"
          secondary="Account"
          secondaryTypographyProps={{ color: 'text.secondary' }}
        />
      </ListItem>
    </DemoList>
  ),
};