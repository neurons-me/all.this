import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@/gui/atoms/ListItemText/ListItemText';
import ListItemIcon from './ListItemIcon';
import Icon from '@/gui/Theme/Icon/Icon';
import GuiProvider from '@/gui/Theme/GuiProvider';

const meta: Meta<typeof ListItemIcon> = {
  title: 'Atoms/Organization/ListItemIcon',
  component: ListItemIcon,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <GuiProvider>
        <div style={{ padding: 16, minHeight: 260, maxWidth: 520 }}>
          <Story />
        </div>
      </GuiProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
The **ListItemIcon** atom is a thin wrapper around MUI's \`MuiListItemIcon\` and remains faithful to its API.

In **declarative** mode, the resolver adds sugar to render icons by **token** via the registry:
- \`icon\`: string token (e.g., \`"lucide:mail"\`, \`"mui:settings"\`) or React node
- \`iconProps\`: forwarded to the registry \`<Icon />\` when \`icon\` is a token
- \`iconColor\`: convenience color for the registry icon
- \`size\`: icon size (default 20)

Tokens are **normalized** (lowercased & trimmed) to avoid missing icons due to casing.

---
## React usage
~~~jsx
<List>
  <ListItem>
    <ListItemIcon sx={{ minWidth: 36 }}>
      <Icon name="lucide:mail" size={20} />
    </ListItemIcon>
    <ListItemText primary="Inbox" />
  </ListItem>
</List>
~~~

## Declarative JSON / Resolver
~~~json
{
  "type": "ListItemIcon",
  "props": {
    "icon": "lucide:mail",
    "sx": { "minWidth": 36 },
    "iconProps": { "strokeWidth": 1.5 }
  }
}
~~~
        `,
      },
    },
    controls: {
      exclude: ['children'],
    },
  },
  argTypes: {
    sx: { control: 'object', table: { category: 'Style' } },
    className: { control: 'text' },
  },
  args: {
    sx: {},
    children: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof ListItemIcon>;

const DemoList: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <List dense>
    <ListItem>{children}</ListItem>
  </List>
);

// ======================= Stories =======================
export const Playground: Story = {
  render: (args) => (
    <DemoList>
      <ListItemIcon {...args}>
        <Icon name="lucide:mail" />
      </ListItemIcon>
      <ListItemText primary="Item with icon slot" />
    </DemoList>
  ),
};

export const WithTokenViaResolverExample: Story = {
  name: 'Declarative token (doc example)',
  render: () => (
    <DemoList>
      {/* Emula el resultado del resolver al usar icon="lucide:mail" */}
      <ListItemIcon sx={{ minWidth: 36 }}>
        <Icon name="mail" fontSize={20} />
      </ListItemIcon>
      <ListItemText primary="Inbox (token)" />
    </DemoList>
  ),
};

export const WithReactChild: Story = {
  render: () => (
    <DemoList>
      <ListItemIcon sx={{ minWidth: 40 }}>
        <Icon name="mui:settings" />
      </ListItemIcon>
      <ListItemText primary="Settings (React child)" />
    </DemoList>
  ),
};

export const WithSx: Story = {
  render: () => (
    <DemoList>
      <ListItemIcon sx={{ minWidth: 48 }}>
        <Icon name="lucide:user" />
      </ListItemIcon>
      <ListItemText primary="Custom minWidth via sx" />
    </DemoList>
  ),
};