import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import List from './List';
import ListItem from '../ListItem/ListItem';
import ListItemIcon from '@/gui/atoms/ListItemIcon/ListItemIcon';
import ListItemText from '@/gui/atoms/ListItemText/ListItemText';
import Icon from '@/gui/Theme/Icon/Icon';
import ListSubheader from '@mui/material/ListSubheader';

const meta: Meta<typeof List> = {
  title: 'Atoms/Organization/List',
  component: List,
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
The **List** atom is a thin wrapper around MUI's \`MuiList\`, staying faithful to its API and polymorphism.

In **declarative** mode (resolver), it forwards MUI props and supports granular styling via \`sx\`.
It also provides sugar: \`subheaderText\` (and \`subheaderSx\`) to easily render a \`<ListSubheader/>\` when you don't pass \`subheader\` explicitly.

---
## React usage
~~~jsx
<List dense subheader={<li />}> // arbitrary subheader (from MUI API)
  <ListItem>
    <ListItemIcon>
      <Icon name="lucide:inbox" />
    </ListItemIcon>
    <ListItemText primary="Inbox" />
  </ListItem>
</List>
~~~

## Declarative JSON / Resolver
~~~json
{
  "type": "List",
  "props": {
    "dense": true,
    "disablePadding": false,
    "subheaderText": "Shortcuts",
    "subheaderSx": { "fontWeight": 600 },
    "sx": { "bgcolor": "background.paper", "borderRadius": 8 }
  }
}
~~~
*Note:* \`subheaderText\`/\`subheaderSx\` are **resolver-only** sugar; they are not MUI props.
        `,
      },
    },
    controls: {
      exclude: ['component', 'children', 'subheader'],
    },
  },
  argTypes: {
    dense: { control: 'boolean' },
    disablePadding: { control: 'boolean' },
    sx: { control: 'object', table: { category: 'Style' } },
  },
  args: {
    dense: false,
    disablePadding: false,
    sx: { bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' },
  },
};

export default meta;

type Story = StoryObj<typeof List>;

const SampleRows: React.FC = () => (
  <>
    <ListItem>
      <ListItemIcon>
        <Icon name="lucide:inbox" />
      </ListItemIcon>
      <ListItemText primary="Inbox" />
    </ListItem>
    <ListItem>
      <ListItemIcon>
        <Icon name="lucide:send" />
      </ListItemIcon>
      <ListItemText primary="Sent" />
    </ListItem>
    <ListItem>
      <ListItemIcon>
        <Icon name="lucide:star" />
      </ListItemIcon>
      <ListItemText primary="Starred" />
    </ListItem>
  </>
);

// ======================= Stories =======================
export const Playground: Story = {
  render: (args) => (
    <List {...args}>
      <SampleRows />
    </List>
  ),
};

export const WithSubheader: Story = {
  name: 'With subheader (MUI prop)',
  render: () => (
    <List subheader={<ListSubheader component="div" sx={{ fontWeight: 600 }}>Shortcuts</ListSubheader>}>
      <SampleRows />
    </List>
  ),
};

export const DenseAndNoPadding: Story = {
  args: { dense: true, disablePadding: true },
  render: (args) => (
    <List {...args}>
      <SampleRows />
    </List>
  ),
};

export const StyledWithSx: Story = {
  args: { sx: { bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 } },
  render: (args) => (
    <List {...args}>
      <SampleRows />
    </List>
  ),
};