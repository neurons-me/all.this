import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import HighLighter, {
  type HighLighterProps,
  DEFAULT_COLORS,
} from '@/gui/widgets/HighLighter/HighLighter';

const meta: Meta<typeof HighLighter> = {
  title: 'Widgets/HighLighter',
  component: HighLighter,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onChange: { action: 'change' },
    colors: { control: 'object' },
    value: { control: 'color' },
    defaultValue: { control: 'color' },
    tooltipSize: {
      control: { type: 'inline-radio' },
      options: ['sm', 'md', 'lg', 'xl'],
    },
    placement: {
      control: { type: 'select' },
      options: [
        'bottom',
        'bottom-end',
        'bottom-start',
        'left',
        'left-end',
        'left-start',
        'right',
        'right-end',
        'right-start',
        'top',
        'top-end',
        'top-start',
      ],
    },
    iconName: { control: 'text' },
    iconSize: { control: 'text' },
    title: { control: 'text' },
    disabled: { control: 'boolean' },
    className: { table: { disable: true } },
    style: { table: { disable: true } },
  },
  args: {
    title: 'Highlighter',
    tooltipSize: 'md',
    placement: 'right',
    iconName: 'ink_marker',
    iconSize: 22,
    colors: DEFAULT_COLORS,
    defaultValue: DEFAULT_COLORS[0],
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof HighLighter>;

export const Playground: Story = {
  render: (args) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <HighLighter {...(args as HighLighterProps)} />
      <Typography variant="body2" sx={{ opacity: 0.7 }}>
        Click highlighter → pick a color
      </Typography>
    </Box>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <HighLighter {...(args as HighLighterProps)} tooltipSize="sm" title="sm" />
      <HighLighter {...(args as HighLighterProps)} tooltipSize="md" title="md" />
      <HighLighter {...(args as HighLighterProps)} tooltipSize="lg" title="lg" />
      <HighLighter {...(args as HighLighterProps)} tooltipSize="xl" title="xl" />
    </Box>
  ),
  parameters: { controls: { exclude: ['tooltipSize', 'title'] } },
};

export const CustomPalette: Story = {
  args: {
    title: 'Pick a neon',
    colors: ['#00F5D4', '#F15BB5', '#FEE440', '#00BBF9', '#9B5DE5'],
    defaultValue: '#FEE440',
  },
  render: (args) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <HighLighter {...(args as HighLighterProps)} />
      <Typography variant="body2" sx={{ opacity: 0.7 }}>
        Custom 5-color palette
      </Typography>
    </Box>
  ),
};

export const Controlled: Story = {
  render: (args) => {
    const [color, setColor] = React.useState<string>(DEFAULT_COLORS[2]);

    React.useEffect(() => {
      const onHighLighter = (e: any) => {
        if (e?.detail?.color) setColor(e.detail.color);
      };
      window.addEventListener('gui:highlighter', onHighLighter as any);
      return () => window.removeEventListener('gui:highlighter', onHighLighter as any);
    }, []);

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: 320 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <HighLighter
            {...(args as HighLighterProps)}
            value={color}
            onChange={(c) => {
              setColor(c);
              (args as any)?.onChange?.(c);
            }}
          />
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Controlled color
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            Selected:
          </Typography>
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: 999,
              bgcolor: color,
              border: '1px solid',
              borderColor: 'divider',
            }}
          />
          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
            {color}
          </Typography>
        </Box>
      </Box>
    );
  },
  parameters: {
    controls: { exclude: ['value', 'defaultValue'] },
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <HighLighter {...(args as HighLighterProps)} />
      <Typography variant="body2" sx={{ opacity: 0.7 }}>
        Disabled
      </Typography>
    </Box>
  ),
};