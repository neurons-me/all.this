import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import ModalBox from "./Modal";
import { Button } from "@mui/material";

const meta: Meta<typeof ModalBox> = {
  title: "Molecules/Display/ModalBox",
  component: ModalBox,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ height: "100vh", overflow: "hidden" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
**ModalBox** is a flexible, theme-aware modal container with optional background blur and 3D placement support via \`xyz\` props.

---
## Features
- Supports background blur overlay for visual depth.
- Centered responsive layout with dynamic width and height.
- Declarative 3D placement via \`xyz: [x, y, z]\`.
- Works with any child components (forms, dialogs, previews, etc.).
- Compatible with GUI registry and schema resolvers.

---
## Props
- \`open\`: Boolean that controls visibility.
- \`title\`: Optional modal header title.
- \`onClose\`: Function triggered when closing.
- \`width\`, \`height\`: Custom modal dimensions.
- \`blurBackground\`: Enables or disables background blur.
- \`xyz\`: 3D position array for spatial positioning.
- \`children\`: Modal content.
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ModalBox>;

export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true); // force open for debugging
    console.log("ModalBox render", { open, args });

    return (
      <div
        style={{
          position: "relative",
          height: "100vh",
          background: "rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ModalBox
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          title={args.title || "Modal Title"}
        >
          <p style={{ color: "#fff" }}>This is an example modal content.</p>
          <p style={{ color: "#ccc" }}>If you see this text, the modal is visible.</p>
        </ModalBox>
      </div>
    );
  },
  args: {
    title: "Example Modal",
    blurBackground: true,
    width: 400,
    height: "auto",
  },
};