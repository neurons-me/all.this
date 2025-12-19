import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Stack from './Stack';
import Paper from '@/gui/atoms/Paper/Paper';
import Link from '@/gui/atoms/Link/Link';

const meta: Meta<typeof Stack> = {
  title: 'Atoms/Containers/Stack',
  component: Stack,
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
The **Stack** atom is a thin wrapper around MUI's \`MuiStack\` that preserves **polymorphism** and forwards all layout props.
It integrates with **This.GUI** theming and supports **declarative specs** through the Stack resolver.

---
## Features
- Direction: \`row\`, \`column\`, and reverse variants
- Spacing/gap via \`spacing\`
- Optional \`divider\`
- Alignment: \`alignItems\`, \`justifyContent\`, \`flexWrap\`
- **Polymorphic** via \`component\` (e.g. 'div', 'section', 'a')
- Full **system props** passthrough via \`sx\`

---
## Basic usage
~~~jsx
<Stack direction="row" spacing={2}>
  <Item />
  <Item />
</Stack>
~~~

## Declarative JSON / Resolver
~~~json
{
  "type": "Stack",
  "props": {
    "direction": "row",
    "spacing": 2,
    "sx": { "alignItems": "center" },
    "children": [
      { "type": "Paper", "props": { "sx": { "p": 1 }, "children": "A" } },
      { "type": "Paper", "props": { "sx": { "p": 1 }, "children": "B" } }
    ]
  }
}
~~~

*Note:* We demonstrate polymorphism in dedicated stories rather than Controls to avoid type-narrowing issues with MUI's OverridableComponent.
        `,
      },
    },
    controls: {
      exclude: ['component'],
    },
  },
  argTypes: {
    direction: {
      control: { type: 'radio' },
      options: ['row', 'row-reverse', 'column', 'column-reverse'],
    },
    spacing: {
      control: { type: 'range', min: 0, max: 8, step: 0.5 },
    },
    useFlexGap: {
      control: 'boolean',
    },
    sx: {
      control: 'object',
    },
  },
  args: {
    direction: 'row',
    spacing: 1.5,
    useFlexGap: true,
    sx: {},
    children: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof Stack>;

const Item = ({ children }: { children: React.ReactNode }) => (
  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
    {children}
  </Paper>
);

// ======================= Stories =======================
export const Playground: Story = {
  render: (args) => (
    <Stack {...args}>
      <Item>A</Item>
      <Item>B</Item>
      <Item>C</Item>
    </Stack>
  ),
};

export const RowSpacing: Story = {
  args: { direction: 'row', spacing: 2 },
  render: (args) => (
    <Stack {...args}>
      <Item>A</Item>
      <Item>B</Item>
      <Item>C</Item>
    </Stack>
  ),
};

export const ColumnSpacing: Story = {
  args: { direction: 'column', spacing: 1.5 },
  render: (args) => (
    <Stack {...args} sx={{ width: 240 }}>
      <Item>A</Item>
      <Item>B</Item>
      <Item>C</Item>
    </Stack>
  ),
};

export const WithDivider: Story = {
  render: (args) => (
    <Stack {...args} direction="row" spacing={2} divider={<span style={{ opacity: 0.5 }}>|</span>}>
      <Item>A</Item>
      <Item>B</Item>
      <Item>C</Item>
    </Stack>
  ),
};

export const PolymorphicSection: Story = {
  render: (args) => (
    <Stack {...args} component="section" spacing={1.5}>
      <Item>Section A</Item>
      <Item>Section B</Item>
    </Stack>
  ),
};

export const PolymorphicRouterLink: Story = {
  render: (args) => (
    <Link to="/docs" style={{ textDecoration: 'none' }}>
      <Stack {...args} spacing={1.5}>
        <Item>Go to Docs</Item>
      </Stack>
    </Link>
  ),
};