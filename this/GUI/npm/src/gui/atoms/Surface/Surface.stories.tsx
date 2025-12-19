import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import Surface from './Surface';
import type { SurfaceProps } from './Surface.types';

const meta: Meta<typeof Surface> = {
  title: 'Atoms/Surface',
  component: Surface,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['elevation', 'outlined', 'card'],
    },
    elevation: {
      control: { type: 'number' },
    },
    square: {
      control: { type: 'boolean' },
    },
    sx: {
      control: false,
      description: 'MUI sx prop (object/function/array). Disabled in controls to avoid noisy UI.',
    },
    children: {
      control: false,
    },
  },
};

export default meta;

type Story = StoryObj<typeof Surface>;

const DemoContent = () => (
  <div>
    <div style={{ fontWeight: 700, marginBottom: 6 }}>Surface</div>
    <div style={{ opacity: 0.78, fontSize: 13 }}>
      A visual container primitive (MUI Paper wrapper).
    </div>
  </div>
);

const baseArgs: Partial<SurfaceProps> = {
  sx: {
    padding: 16,
    width: 360,
    maxWidth: '100%',
  },
  children: <DemoContent />,
};

export const Elevation: Story = {
  args: {
    ...baseArgs,
    variant: 'elevation',
    elevation: 2,
  },
};

export const Outlined: Story = {
  args: {
    ...baseArgs,
    variant: 'outlined',
  },
};

export const Card: Story = {
  args: {
    ...baseArgs,
    variant: 'card',
    sx: [
      (theme) => ({
        padding: 18,
        borderRadius: theme.shape?.borderRadius ?? 8,
      }),
    ],
  },
};

export const Square: Story = {
  args: {
    ...baseArgs,
    variant: 'outlined',
    square: true,
  },
};

export const CustomSx: Story = {
  args: {
    ...baseArgs,
    variant: 'elevation',
    elevation: 1,
    sx: [
      baseArgs.sx as any,
      {
        border: '1px dashed',
        borderColor: 'divider',
      },
    ],
  },
};
