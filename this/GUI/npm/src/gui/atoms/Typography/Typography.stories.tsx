import type { Meta, StoryObj } from '@storybook/react';
import Typography from './Typography';
import Link from '../Link/Link';

const meta = {
  title: 'Atoms/Content/Typography',
  component: Typography,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
        <div style={{ padding: 24 }}>
          <Story />
        </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
**Typography** is a thin, polymorphic wrapper around MUI's Typography that keeps the full API
while exposing it through This.GUI. Import it from **@/gui/primitives** instead of @mui/material so
you can swap render engines in the future without breaking consumers.

### Key points
- Preserves MUI's polymorphism (\`component\`, \`as\`, \`variantMapping\`).
- Works with routers and anchors: \`component={Link}\` + \`to\`, or \`component="a"\` + \`href\`.
- Styled by your This.GUI theme (typography, palette, spacing).

### Common variants
MUI variants like \`h1..h6\`, \`subtitle1/2\`, \`body1/2\`, \`caption\`, \`overline\` are supported.

### Declarative JSON example
You can describe text nodes in JSON and hydrate them in a renderer:

~~~json
{
  "type": "Typography",
  "props": {
    "variant": "h4",
    "component": "h2",
    "gutterBottom": true
  },
  "children": "Section Title"
}
~~~

A naive hydration would look like:

~~~tsx
const spec = {
  type: 'Typography',
  props: { variant: 'h4', component: 'h2', gutterBottom: true },
  children: 'Section Title'
};

<Typography {...spec.props}>{spec.children}</Typography>
~~~
        `,
      },
    },
    controls: { exclude: ['component', 'to', 'href', 'variantMapping', 'ref'] },
  },
} satisfies Meta<typeof Typography>;

export default meta;

type Story = StoryObj<typeof Typography>;

export const Basic: Story = {
  args: {
    variant: 'body1',
    children: 'Hello from Typography',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      <Typography variant="h1">h1. Heading</Typography>
      <Typography variant="h2">h2. Heading</Typography>
      <Typography variant="h3">h3. Heading</Typography>
      <Typography variant="h4">h4. Heading</Typography>
      <Typography variant="h5">h5. Heading</Typography>
      <Typography variant="h6">h6. Heading</Typography>
      <Typography variant="subtitle1">subtitle1</Typography>
      <Typography variant="subtitle2">subtitle2</Typography>
      <Typography variant="body1">body1</Typography>
      <Typography variant="body2">body2</Typography>
      <Typography variant="caption">caption</Typography>
      <Typography variant="overline">overline</Typography>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Preview of common Material UI typography variants.'
      }
    }
  }
};

export const AsPropAndGutter: Story = {
  name: 'Semantic element (component) + gutter',
  render: () => (
    <div>
      <Typography variant="h4" component="h2" gutterBottom>
        Section title (rendered as h2)
      </Typography>
      <Typography variant="body1">
        Body text below the title. The \`gutterBottom\` on the title adds spacing.
      </Typography>
    </div>
  ),
};

export const Alignment: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      <Typography align="left">Left aligned</Typography>
      <Typography align="center">Center aligned</Typography>
      <Typography align="right">Right aligned</Typography>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      <Typography color="text.primary">text.primary</Typography>
      <Typography color="text.secondary">text.secondary</Typography>
      <Typography color="primary">primary</Typography>
      <Typography color="#00aa96">#00aa96 (custom)</Typography>
    </div>
  ),
};

export const WithRouterAndAnchor: Story = {
  name: 'Routing & anchors',
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {/* Router link (uses This.GUI Link under the hood) */}
      <Typography component={Link as any} to="/docs" underline="none">
        Go to /docs (Router link)
      </Typography>

      {/* External anchor */}
      <Typography component="a" href="https://neurons.me" target="_blank" rel="noopener noreferrer">
        Visit neurons.me (anchor)
      </Typography>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates polymorphism: render as router link (with `to`) and as anchor (with `href`).'
      }
    }
  }
};

export const VariantMappingOverride: Story = {
  name: 'variantMapping override',
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      <Typography
        variant="subtitle1"
        variantMapping={{ subtitle1: 'h3', body1: 'p' }}
      >
        subtitle1 text rendered as an H3 element via variantMapping
      </Typography>
      <Typography
        variant="body1"
        variantMapping={{ subtitle1: 'h3', body1: 'p' }}
      >
        body1 text rendered as a P element via variantMapping
      </Typography>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'MUI Typography allows remapping variants to different HTML elements without changing visual style.'
      }
    }
  }
};

export const DeclarativeSpec: Story = {
  name: 'Declarative (JSON → Typography)',
  render: () => {
    const spec = {
      type: 'Typography',
      props: { variant: 'h5', component: 'h3', gutterBottom: true },
      children: 'Declaratively rendered title',
    } as const;

    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <pre style={{ background: 'rgba(127,127,127,0.08)', padding: 12, borderRadius: 8 }}>
{`{
  "type": "Typography",
  "props": {
    "variant": "h5",
    "component": "h3",
    "gutterBottom": true
  },
  "children": "Declaratively rendered title"
}`}
        </pre>
        {/* naive renderer */}
        <Typography {...spec.props}>{spec.children}</Typography>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Example of hydrating a Typography node from a JSON spec. In production, your app would use a central registry/renderer.'
      }
    }
  }
};