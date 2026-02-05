import type { Meta, StoryObj } from '@storybook/react';
import { Link, Button } from '@/gui/atoms';
// ======================= Meta =======================
const meta: Meta<typeof Link> = {
  title: 'Atoms/Navigation/Link',
  component: Link,
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
The **Link** primitive is a thin wrapper over MUI's \`MuiLink\` that supports **both** external links (\`href\`) and internal routing (\`to\`) using **react-router-dom**. It integrates with **This.GUI** theming via the \`Theme\` provider.

---
## Features
- External links with \`href\` (renders an anchor).
- Internal navigation with \`to\` (renders a RouterLink under the hood).
- Works seamlessly as a child or as a render target for other primitives (e.g. \`<Button component={Link} to="/docs"/>\`).
- Inherits typography and color from the theme tokens.

---
## Key Props
- \`href?: string\` — external URL.
- \`to?: string | LocationDescriptor\` — internal route (react-router-dom).
- \`underline?: 'none' | 'hover' | 'always'\` — underline behavior.
- \`color?: 'primary' | 'secondary' | 'inherit' | 'textPrimary' | 'textSecondary' | 'error' | 'info' | 'success' | 'warning'\`.

> Note: \`to\` and \`href\` are demonstrated in dedicated stories rather than Storybook controls.

---
## Basic Usage
~~~jsx
import { Link } from '@/gui/primitives';

<Link href="https://neurons.me" target="_blank" rel="noreferrer">Visit neurons.me</Link>
~~~

## Internal Routing
~~~jsx
import { Link } from '@/gui/primitives';

<Link to="/docs">Go to docs</Link>
~~~

## As render target for Button
~~~jsx
import { Button, Link } from '@/gui/primitives';

<Button component={Link} to="/docs">Docs</Button>
~~~

## Declarative JSON / Config usage
~~~json
{
  "type": "Link",
  "props": {
    "to": "/docs",
    "children": "Go to docs"
  }
}
~~~

Another example with an external URL:
~~~json
{
  "type": "Link",
  "props": {
    "href": "https://neurons.me",
    "target": "_blank",
    "rel": "noreferrer",
    "children": "Visit neurons.me"
  }
}
~~~
        `,
      },
    },
  },
  argTypes: {
    underline: {
      control: { type: 'radio' },
      options: ['none', 'hover', 'always'],
    },
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'inherit', 'textPrimary', 'textSecondary', 'error', 'info', 'success', 'warning'],
    },
    // Do not expose component/to/href as controls — they are shown in dedicated stories
    component: { table: { disable: true } },
  },
  args: {
    underline: 'hover',
    color: 'primary',
    children: 'Example link',
  },
};
export default meta;

type Story = StoryObj<typeof Link>;

// ======================= Stories =======================
export const Playground: Story = {};

export const ExternalHref: Story = {
  name: 'External (href)',
  render: () => (
    <Link href="https://neurons.me" target="_blank" rel="noreferrer">
      Visit neurons.me
    </Link>
  ),
};

export const InternalTo: Story = {
  name: 'Internal (to)',
  render: () => <Link to="/docs">Go to docs</Link>,
};

export const Colors: Story = {
  render: (args) => {
    const colors: Array<any> = ['primary', 'secondary', 'success', 'info', 'warning', 'error'];
    return (
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {colors.map((c) => (
          <Link key={c} {...args} color={c} href="#">
            {c[0].toUpperCase() + c.slice(1)}
          </Link>
        ))}
      </div>
    );
  },
};

export const UnderlineVariants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Link {...args} underline="none" href="#">None</Link>
      <Link {...args} underline="hover" href="#">Hover</Link>
      <Link {...args} underline="always" href="#">Always</Link>
    </div>
  ),
};

export const AsButtonTarget: Story = {
  name: 'As Button component',
  render: () => (
    <Button component={Link} to="/docs">
      Docs via Link
    </Button>
  ),
};
