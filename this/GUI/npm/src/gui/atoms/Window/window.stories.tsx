import type { Meta, StoryObj } from '@storybook/react';
import UncontainedUI from './window';
const meta: Meta<typeof UncontainedUI> = {
  title: 'Atoms/Window',
  component: UncontainedUI,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof UncontainedUI>;
export const Default: Story = {
  args: {},
  render: () => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <UncontainedUI />
    </div>
  ),
};