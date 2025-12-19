import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Collapse from './Collapse';

const meta: Meta<typeof Collapse> = {
  title: 'Atoms/Content/Collapse',
  component: Collapse,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
        <div style={{ padding: 16, minHeight: 220 }}>
          <Story />
        </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
The **Collapse** atom is a thin wrapper around MUI's \`MuiCollapse\`, staying faithful to its API and polymorphism.

In **declarative** mode (resolver), it forwards MUI props as-is and supports granular styling via \`sx\` on the root.

---
## React usage
~~~jsx
const [open, setOpen] = React.useState(true);

<Collapse in={open}>
  <div style={{ padding: 12, border: '1px solid var(--mui-palette-divider)', borderRadius: 8 }}>
    Collapsible content
  </div>
</Collapse>
~~~

## Declarative JSON / Resolver
~~~json
{
  "type": "Collapse",
  "props": {
    "in": true,
    "orientation": "vertical",
    "sx": { "border": "1px dashed", "borderColor": "divider", "p": 1 }
  }
}
~~~
        `,
      },
    },
    controls: {
      exclude: ['component', 'children', 'as', 'timeout', 'easing'],
    },
  },
  argTypes: {
    in: { control: 'boolean', description: 'Show/Hide content' },
    orientation: { control: { type: 'radio' }, options: ['vertical', 'horizontal'] },
    collapsedSize: { control: 'text', description: 'number or CSS size' },
    unmountOnExit: { control: 'boolean' },
    mountOnEnter: { control: 'boolean' },
    appear: { control: 'boolean' },
    sx: { control: 'object' },
  },
  args: {
    in: true,
    orientation: 'vertical',
    collapsedSize: 0,
    unmountOnExit: false,
    mountOnEnter: false,
    appear: false,
    sx: {},
    children: undefined,
  },
};

export default meta;

type Story = StoryObj<typeof Collapse>;

const DemoBlock: React.FC<{ label?: string } & React.HTMLAttributes<HTMLDivElement>> = ({ label = 'Collapsible content', ...rest }) => (
  <div
    {...rest}
    style={{
      padding: 12,
      border: '1px solid var(--mui-palette-divider)',
      borderRadius: 8,
      background: 'var(--mui-palette-background-paper)',
      ...rest.style,
    }}
  >
    {label}
  </div>
);

// ======================= Stories =======================
export const Playground: Story = {
  render: (args) => <Collapse {...args}><DemoBlock /></Collapse>,
};

export const Horizontal: Story = {
  args: { orientation: 'horizontal', in: true, collapsedSize: 0 },
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Collapse {...args}>
        <DemoBlock label="Horizontal content" style={{ width: 240 }} />
      </Collapse>
      <span style={{ opacity: 0.7, fontSize: 12 }}>(Try toggling the \"in\" control)</span>
    </div>
  ),
};

export const WithSx: Story = {
  args: { sx: { border: '1px dashed', borderColor: 'divider', p: 1 } },
  render: (args) => (
    <Collapse {...args}>
      <DemoBlock label="Styled via sx on Collapse" />
    </Collapse>
  ),
};

export const UnmountOnExit: Story = {
  args: { unmountOnExit: true, in: false },
  render: (args) => (
    <div>
      <p style={{ margin: 0, opacity: 0.75 }}>Content is removed from the DOM when closed.</p>
      <Collapse {...args}>
        <DemoBlock label="Unmounts when closed" />
      </Collapse>
    </div>
  ),
};