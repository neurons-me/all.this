import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import Identities from "./identities";

const meta: Meta<typeof Identities> = {
  title: "Identity Noise/Identities",
  component: Identities,
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof Identities>;

export const Default: Story = {
  render: () => <Identities />,
};
