import type { Meta, StoryObj } from '@storybook/react';
import { Section, Typography, Box, Button } from '@/gui/components/atoms';

// ======================= Meta =======================
const meta: Meta<typeof Section> = {
  title: 'Atoms/Containers/Section',
  component: Section,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ padding: 0, minHeight: 400 }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
The **Section** atom is a responsive container designed to create consistent layout sections that respect This.GUI’s **layout insets** and **theme palette**.

It supports theming via the \`section\` palette keys (\`default\`, \`subtle\`, \`strong\`) and allows custom background colors for flexibility.

---
## Features
- Reacts to global layout insets for responsive spacing.
- Provides unified paddings with theme scaling.
- Accepts **custom backgroundColor**, or one from \`theme.palette.section\`.
- Supports responsive padding, height, and alignment.
- Can wrap any children content.

---
## Margin Props
Section supports **margin props** for controlling the outer spacing around the section:

- \`marginTop\`
- \`marginBottom\`
- \`marginLeft\`
- \`marginRight\`

Each of these can be a \`number\`, \`string\`, or a **breakpoint object** (e.g. \`{ xs: 2, sm: 4, md: 6 }\`) for responsive margins.

If not provided, Section will use the layout insets as fallback margins to ensure consistent spacing with the overall layout.

---
## Key Props
- \`colorVariant?: 'default' | 'subtle' | 'strong'\` — Selects section background color from theme.
- \`bgcolor?: string\` — Overrides the background with a custom color.
- \`padding?: number | string | object\` — Adjusts inner spacing responsively.
- \`height?: number | string\` — Sets the vertical height.
- \`sx?: object\` — MUI system style overrides.
- \`marginTop?: number | string | object\`
- \`marginBottom?: number | string | object\`
- \`marginLeft?: number | string | object\`
- \`marginRight?: number | string | object\`

---
## Basic usage (React)
~~~tsx
import { Section, Typography } from '@/gui/atoms';

<Section colorVariant="default" padding={4}>
  <Typography variant="h4">Welcome</Typography>
  <Typography>Section content goes here.</Typography>
</Section>

// Example with margin props
<Section colorVariant="subtle" padding={4} marginTop={2} marginBottom={3}>
  <Typography variant="h5">Section with Margins</Typography>
  <Typography>Section content with custom top and bottom margins.</Typography>
</Section>
~~~

---
## Declarative JSON / Config usage
~~~json
{
  "type": "Section",
  "props": {
    "colorVariant": "subtle",
    "padding": 4,
    "marginTop": 2,
    "marginBottom": 3,
    "children": [
      { "type": "Typography", "props": { "variant": "h5", "children": "Hello world" } },
      { "type": "Typography", "props": { "children": "This is a declarative section example." } }
    ]
  }
}
~~~
        `,
      },
    },
  },
  argTypes: {
    colorVariant: {
      control: { type: 'select' },
      options: ['default', 'subtle', 'strong'],
      description: 'Predefined section variant based on theme.palette.section',
    },
    bgcolor: { control: 'color', description: 'Custom background color override' },
    padding: { control: { type: 'number' }, description: 'Internal padding' },
    height: { control: { type: 'text' }, description: 'Height (px, %, vh, etc.)' },
  },
  args: {
    colorVariant: 'default',
    padding: 4,
    height: 'auto',
  },
};
export default meta;

type Story = StoryObj<typeof Section>;

// ======================= Stories =======================

export const Playground: Story = {
  render: (args) => (
    <Section {...args}>
      <Typography variant="h5" sx={{ mb: 1 }}>Playground Section</Typography>
      <Typography variant="body2">Easily tweak padding, background, and height.</Typography>
    </Section>
  ),
};

export const Variants: Story = {
  render: (args) => (
    <Box sx={{ display: 'grid', gap: 2 }}>
      {(['default', 'subtle', 'strong'] as const).map((variant) => (
        <Section key={variant} {...args} colorVariant={variant} padding={3}>
          <Typography variant="subtitle1">colorVariant = {variant}</Typography>
          <Typography variant="body2">
            This uses <code>theme.palette.section.{variant}</code>
          </Typography>
        </Section>
      ))}
    </Box>
  ),
};

export const CustomBackground: Story = {
  args: { padding: 4, bgcolor: '#2fb0a3ff' },
  render: (args) => (
    <Section {...args}>
      <Typography variant="h6" sx={{ color: 'text.primary' }}>
        Custom background color
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        You can set <code>bgcolor</code> manually for any theme or design, and it will maintain good contrast for both light and dark text.
      </Typography>
    </Section>
  ),
};

export const WithContentComposition: Story = {
  render: () => (
    <Section colorVariant="default" padding={4}>
      <Typography variant="h5" sx={{ mb: 1 }}>Section with Composition</Typography>
      <Box display="flex" gap={2}>
        <Button variant="contained" color="primary">Accept</Button>
        <Button variant="outlined" color="secondary">Cancel</Button>
      </Box>
    </Section>
  ),
};

export const ResponsivePadding: Story = {
  args: { padding: { xs: 2, sm: 4, md: 6 } },
  render: (args) => (
    <Section {...args}>
      <Typography variant="h5">Responsive Padding</Typography>
      <Typography variant="body2">
        Resize the viewport to see the padding adjust responsively.
      </Typography>
    </Section>
  ),
};

export const ResponsiveMargins: Story = {
  args: { marginTop: { xs: 1, sm: 2, md: 4 }, marginBottom: { xs: 1, sm: 3, md: 5 } },
  render: (args) => (
    <Section {...args} padding={3}>
      <Typography variant="h5">Responsive Margins</Typography>
      <Typography variant="body2">
        Adjusts top and bottom margins responsively across breakpoints.
      </Typography>
    </Section>
  ),
};