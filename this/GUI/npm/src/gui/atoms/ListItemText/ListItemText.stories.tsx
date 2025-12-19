import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ListItemText from './ListItemText';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

const meta: Meta<typeof ListItemText> = {
  title: 'Atoms/Organization/ListItemText',
  component: ListItemText,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
        <div style={{ padding: 16, minHeight: 260, maxWidth: 520 }}>
          <Story />
        </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
The **ListItemText** atom is a thin wrapper around MUI's \`MuiListItemText\`.  
It preserves MUI props and typing (faithful to the original), and fits naturally into This.GUI's declarative/resolver pattern.

---
## Basic usage
~~~jsx
<List>
  <ListItem>
    <ListItemText primary="Single line" />
  </ListItem>
  <ListItem>
    <ListItemText primary="Primary" secondary="Secondary description" />
  </ListItem>
</List>
~~~

## Typography control
~~~jsx
<List>
  <ListItem>
    <ListItemText
      primary="Custom primary"
      primaryTypographyProps={{ variant: 'subtitle1', sx: { fontWeight: 600 } }}
    />
  </ListItem>
  <ListItem>
    <ListItemText
      primary="Primary"
      secondary="Secondary"
      secondaryTypographyProps={{ color: 'text.secondary', sx: { fontStyle: 'italic' } }}
    />
  </ListItem>
</List>
~~~

## Declarative JSON / Resolver
~~~json
{
  "type": "ListItemText",
  "props": {
    "primary": "Primary",
    "secondary": "Secondary",
    "primarySx": { "fontWeight": 600 },
    "secondarySx": { "color": "text.secondary", "fontStyle": "italic" }
  }
}
~~~

*Note:* In React usage, use \`primaryTypographyProps.sx\` / \`secondaryTypographyProps.sx\`.  
In declarative mode, you can also use \`primarySx\` / \`secondarySx\` and the resolver will merge them into the Typography slot props.
        `,
      },
    },
    controls: {
      exclude: ['component', 'primaryTypographyProps', 'secondaryTypographyProps'],
    },
  },
  argTypes: {
    primary: { control: 'text' },
    secondary: { control: 'text' },
    inset: { control: 'boolean' },
    disableTypography: { control: 'boolean' },
    sx: { control: 'object' },
  },
  args: {
    primary: 'Primary',
    secondary: 'Secondary',
    inset: false,
    disableTypography: false,
    sx: {},
  },
};

export default meta;
type Story = StoryObj<typeof ListItemText>;

const DemoList: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <List dense>
    <ListItem>{children}</ListItem>
  </List>
);

// ======================= Stories =======================
export const Playground: Story = {
  render: (args) => (
    <DemoList>
      <ListItemText {...args} />
    </DemoList>
  ),
};

export const PrimaryOnly: Story = {
  args: { secondary: '' },
  render: (args) => (
    <DemoList>
      <ListItemText {...args} />
    </DemoList>
  ),
};

export const WithTypographyProps: Story = {
  render: () => (
    <List>
      <ListItem>
        <ListItemText
          primary="Custom primary"
          primaryTypographyProps={{ variant: 'subtitle1', sx: { fontWeight: 600 } }}
        />
      </ListItem>
      <ListItem>
        <ListItemText
          primary="Primary"
          secondary="Secondary"
          secondaryTypographyProps={{ color: 'text.secondary', sx: { fontStyle: 'italic' } }}
        />
      </ListItem>
    </List>
  ),
};

export const InsetAndDisabledTypography: Story = {
  render: () => (
    <List>
      <ListItem>
        <ListItemText primary="Inset item" inset />
      </ListItem>
      <ListItem>
        <ListItemText
          primary={<strong>Disable Typography wrapper</strong>}
          disableTypography
        />
      </ListItem>
    </List>
  ),
};