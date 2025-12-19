import type { Meta, StoryObj } from '@storybook/react';
import CardContent from './CardContent';
import Typography from '@mui/material/Typography';
const meta: Meta<typeof CardContent> = {
  title: 'Molecules/Cards/Card/CardContent',
  component: CardContent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CardContent>;

export const BasicContent: Story = {
  render: () => (
    <CardContent>
      <Typography variant="body1">
        This is the main content area inside a card. You can place any children here.
      </Typography>
    </CardContent>
  ),
  name: 'Basic CardContent',
};

export const WithPaddingAndText: Story = {
  render: () => (
    <CardContent sx={{ p: 4 }}>
      <Typography variant="h6">Custom Padding</Typography>
      <Typography variant="body2">
        This CardContent component has extra padding applied via the `sx` prop.
      </Typography>
    </CardContent>
  ),
  name: 'CardContent with sx',
};