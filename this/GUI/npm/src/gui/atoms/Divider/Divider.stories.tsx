import type { Meta, StoryObj } from '@storybook/react';
import { Divider, Box, Typography, Stack } from '@/gui/atoms';

const meta: Meta<typeof Divider> = {
  title: 'Atoms/Content/Divider',
  component: Divider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The Divider component is a thin wrapper over MUI\'s `MuiDivider`. It preserves all props and allows styling via the `sx` prop.',
      },
    },
  },
  argTypes: {
    orientation: {
      control: { type: 'radio' },
      options: ['horizontal', 'vertical'],
      description: 'The divider orientation.',
    },
    variant: {
      control: { type: 'radio' },
      options: ['fullWidth', 'inset', 'middle'],
      description: 'The variant to use.',
    },
    flexItem: {
      control: { type: 'boolean' },
      description: 'If true, the divider is a flex item.',
    },
  },
  args: {
    orientation: 'horizontal',
    variant: 'fullWidth',
    flexItem: false,
  },
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Playground: Story = {
  render: (args) => (
    <Stack spacing={2} sx={{ width: 300 }}>
      <Typography>Item One</Typography>
      <Divider {...args} />
      <Typography>Item Two</Typography>
      <Divider {...args} />
      <Typography>Item Three</Typography>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the Divider component with customizable props in a vertical stack.',
      },
    },
  },
};

export const VerticalDivider: Story = {
  render: () => (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ height: 100 }}>
      <Typography>Left</Typography>
      <Divider orientation="vertical" flexItem />
      <Typography>Right</Typography>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows a vertical divider between two items in a horizontal stack.',
      },
    },
  },
};

export const InsetDivider: Story = {
  render: () => (
    <Stack spacing={2} sx={{ width: 300 }}>
      <Typography>First</Typography>
      <Divider variant="inset" />
      <Typography>Second</Typography>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the inset variant of the Divider between text items.',
      },
    },
  },
};

export const TextDivider: Story = {
  render: () => (
    <Box sx={{ width: 300 }}>
      <Divider>Text Content</Divider>
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows a divider with text content in the middle.',
      },
    },
  },
};
