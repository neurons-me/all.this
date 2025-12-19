import type { Meta, StoryObj } from '@storybook/react';
import Avatar from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Atoms/Elements/Avatar',
  component: Avatar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const InitialsAvatar: Story = {
  render: () => (
    <Avatar>
      AB
    </Avatar>
  ),
  name: 'With Initials',
};

export const ImageAvatar: Story = {
  render: () => (
    <Avatar alt="Abella" src="https://i.pravatar.cc/150?img=32" />
  ),
  name: 'With Image',
};

export const SquareAvatar: Story = {
  render: () => (
    <Avatar variant="square">
      SQ
    </Avatar>
  ),
  name: 'Square Variant',
};