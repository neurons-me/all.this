import type { Meta, StoryObj } from '@storybook/react';
import Card from './Card';
import Typography from '@mui/material/Typography';

const meta: Meta<typeof Card> = {
  title: 'Atoms/Organization/Card/Card',
  component: Card,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const BasicCard: Story = {
  render: () => (
    <Card sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Basic Card
      </Typography>
      <Typography variant="body2">
        This is a simple card using the GUI Card atom. It supports all typical MUI props.
      </Typography>
    </Card>
  ),
  name: 'Basic Card',
};

export const OutlinedCard: Story = {
  render: () => (
    <Card variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Outlined Card
      </Typography>
      <Typography variant="body2">
        This card uses the `variant="outlined"` prop for a border style.
      </Typography>
    </Card>
  ),
  name: 'Outlined Card',
};

export const RaisedCard: Story = {
  render: () => (
    <Card raised sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Raised Card
      </Typography>
      <Typography variant="body2">
        Raised cards use elevation to create visual depth.
      </Typography>
    </Card>
  ),
  name: 'Raised Card',
};