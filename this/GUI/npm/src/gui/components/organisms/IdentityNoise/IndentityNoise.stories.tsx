import type { Meta, StoryObj } from "@storybook/react";
import IndentityNoise from "./IdentityNoise";
const meta: Meta<typeof IndentityNoise> = {
  title: "Identity Noise",
  component: IndentityNoise,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof IndentityNoise>;
export const Default: Story = {
  render: () => <IndentityNoise />,
};