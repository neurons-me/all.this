import type { Meta, StoryObj } from '@storybook/react';
import CardActions from './CardActions';
import Button from '@/gui/atoms/Button/Button';

const meta: Meta<typeof CardActions> = {
  title: 'Atoms/Organization/Card/CardActions',
  component: CardActions,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CardActions>;

export const BasicActions: Story = {
  render: () => (
    <CardActions>
      <Button>Cancel</Button>
      <Button variant="contained" color="primary">Submit</Button>
    </CardActions>
  ),
  name: 'Basic Actions',
};

export const WithSpacingDisabled: Story = {
  render: () => (
    <CardActions disableSpacing>
      <Button>Back</Button>
      <Button variant="outlined">Next</Button>
    </CardActions>
  ),
  name: 'Actions without spacing',
};