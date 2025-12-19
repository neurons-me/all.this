import type { Meta, StoryObj } from '@storybook/react';
import Paper from './Paper';

const meta: Meta<typeof Paper> = {
  title: 'Atoms/Containers/Paper',
  component: Paper,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
        <div style={{ padding: 16, minHeight: 240, background: 'var(--mui-palette-background-default)' }}>
          <Story />
        </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
The **Paper** atom is a thin wrapper around MUI's \`MuiPaper\` that preserves **polymorphism** via the \`component\` prop and passes through all MUI props.
It integrates with **This.GUI** theming and supports **declarative specs** through the Paper resolver.

---
## Features
- Variants: \`elevation\`, \`outlined\`
- Elevation: \`0..24\`
- \`square\` boolean
- **Polymorphic** via \`component\` (e.g., \`'div'\`, \`'section'\`, \`'a'\`)
- **Routing default** in declarative mode: if \`to\` is provided (and no explicit \`component\`), resolver renders This.GUI \`Link\`
- Full **system props** passthrough via \`sx\` (and regular MUI system props)

---
## Basic usage
~~~jsx
import Paper from '@/gui/atoms/Paper/Paper';

<Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
  Content
</Paper>
~~~

## Polymorphic
~~~jsx
<Paper component="section" variant="outlined" sx={{ p: 2 }}>
  I'm a &lt;section&gt;
</Paper>

<Paper component="a" href="/docs" sx={{ p: 2, textDecoration: 'none' }}>
  Go to docs
</Paper>
~~~

*Note:* The \`component\` prop is demonstrated via dedicated stories (not Controls) because Storybook's args typing for MUI OverridableComponent can incorrectly narrow props and flag \`component\` as invalid in the Controls panel.

## Declarative JSON / Resolver
When using the registry-driven renderer, a Paper spec like this:

~~~json
{
  "type": "Paper",
  "props": {
    "variant": "outlined",
    "elevation": 0,
    "component": "section",
    "sx": { "p": 2, "borderRadius": 2 },
    "children": "Content"
  }
}
~~~

**Routing (declarative default)** — If you provide \`to\` (and **omit** \`component\`), the resolver will render using This.GUI \`Link\`:

~~~json
{
  "type": "Paper",
  "props": {
    "to": "/docs",
    "sx": { "p": 2 },
    "children": "Go to docs"
  }
}
~~~

The resolver:
- Chooses \`component\` by priority: explicit \`component\` → \`as\` → (\`to\` ⇒ This.GUI \`Link\`) → (\`external\` ⇒ \`'a'\`)
- For \`external: true\`, applies safe defaults: \`target="_blank"\`, \`rel="noopener noreferrer"\`
- Cleans resolver-only keys so they don't leak into the DOM
        `,
      },
    },
    controls: {
      exclude: ['component'],
    },
  },
  argTypes: {
    variant: {
      control: { type: 'radio' },
      options: ['elevation', 'outlined'],
    },
    elevation: {
      control: { type: 'range', min: 0, max: 24, step: 1 },
    },
    square: {
      control: 'boolean',
    },
    sx: {
      control: 'object',
    },
  },
  args: {
    variant: 'elevation',
    elevation: 1,
    square: false,
    children: 'Paper content',
    sx: { p: 2 },
  },
};

export default meta;
type Story = StoryObj<typeof Paper>;

// ======================= Stories =======================
export const Playground: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Paper {...args} variant="elevation">Elevation (default)</Paper>
      <Paper {...args} variant="outlined">Outlined</Paper>
    </div>
  ),
};

export const Elevations: Story = {
  args: { variant: 'elevation' },
  render: (args) => {
    const levels = [0, 1, 2, 3, 4, 6, 8, 12, 16, 24];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {levels.map((e) => (
          <Paper key={e} {...args} elevation={e} sx={{ p: 2 }}>
            elevation={e}
          </Paper>
        ))}
      </div>
    );
  },
};

export const PolymorphicSection: Story = {
  args: { variant: 'outlined', children: 'I render as <section>' },
  render: (args) => (
    <Paper {...args} component="section">
      {args.children}
    </Paper>
  ),
};

export const PolymorphicAnchor: Story = {
  args: { children: 'I render as <a href="/docs">', sx: { p: 2, textDecoration: 'none' } },
  render: (args) => (
    <Paper component="a" href="/docs" sx={args.sx}>
      {args.children}
    </Paper>
  ),
};

export const WithSystemProps: Story = {
  name: 'With system props',
  args: { variant: 'outlined' },
  render: (args) => (
    <Paper {...args} sx={{ p: 2, m: 1, display: 'inline-block', borderRadius: 2 }}>
      Padding, margin, display via system props.
    </Paper>
  ),
};

export const WithSx: Story = {
  args: { variant: 'outlined' },
  render: (args) => (
    <Paper {...args} sx={{ p: 2, borderRadius: 2, borderStyle: 'dashed' }}>
      Custom \`sx\` styling (dashed outline).
    </Paper>
  ),
};