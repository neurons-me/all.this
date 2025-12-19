import type { Meta, StoryObj } from '@storybook/react';
import CardHeader from './CardHeader';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Icon from '@/gui/Theme/Icon/Icon';
const meta: Meta<typeof CardHeader> = {
  title: 'Molecules/Cards/Card/CardHeader',
  component: CardHeader,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CardHeader>;
export const BasicHeader: Story = {
  render: () => (
    <CardHeader
      title="Card Title"
      subheader="September 20, 2025"
    />
  ),
  name: 'Basic Header',
};

export const WithAvatarAndAction: Story = {
  render: () => (
    <CardHeader
      avatar={<Avatar aria-label="recipe">R</Avatar>}
      action={
        <IconButton aria-label="settings">
          <Icon name="more_vert" />
        </IconButton>
      }
      title="Shrimp and Chorizo Paella"
      subheader="September 20, 2025"
    />
  ),
  name: 'Header with Avatar and Action',
};