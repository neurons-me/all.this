import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip, Button, Typography } from '@/gui/components/atoms';

const meta: Meta<typeof Tooltip> = {
  title: 'Atoms/Content/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "This Tooltip is a thin wrapper around MUI's Tooltip, supporting all MUI props and the `sx` prop for styling. Use it for helpful hover information, and configure it via JSON/config declaratively.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Playground: Story = {
  args: {
    title: 'Tooltip text',
    placement: 'top',
    arrow: false,
    size: 'md',
    children: <Button variant="contained">Hover me</Button>,
  },
  argTypes: {
    title: { control: 'text' },
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    arrow: { control: 'boolean' },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
  render: (args) => <Tooltip {...args} size={args.size}>{args.children}</Tooltip>,
};

export const PlacementRight: Story = {
  name: 'Placement: right',
  render: () => (
    <Tooltip title="Right placed tooltip" placement="right">
      <Button variant="contained">Hover right</Button>
    </Tooltip>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tooltip with `placement="right"` demonstrates MUI placement support.',
      },
    },
  },
};

export const WithArrow: Story = {
  name: 'Arrow',
  render: () => (
    <Tooltip title="Tooltip with arrow" arrow>
      <Button variant="contained">Hover arrow</Button>
    </Tooltip>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tooltip with `arrow={true}` prop shows the arrow, just like MUI.',
      },
    },
  },
};

export const WithTypography: Story = {
  name: 'Wrapped Typography',
  render: () => (
    <Tooltip title="Tooltip on text">
      <Typography variant="body1" sx={{ cursor: 'pointer', display: 'inline-block' }}>
        Hover this text
      </Typography>
    </Tooltip>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tooltip wrapping a Typography element, showing flexibility and full MUI compatibility.',
      },
    },
  },
};


export const WithSize: Story = {
  name: 'With Size',
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      <Tooltip title="Small size tooltip" size="sm">
        <Button variant="contained">Small (sm)</Button>
      </Tooltip>
      <Tooltip title="Medium size tooltip" size="md">
        <Button variant="contained">Medium (md)</Button>
      </Tooltip>
      <Tooltip title="Large size tooltip" size="lg">
        <Button variant="contained">Large (lg)</Button>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the Tooltip with different `size` props: small, medium, and large.',
      },
    },
  },
};