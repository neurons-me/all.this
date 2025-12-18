import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { QRouter } from "./QRouter";
import { Link, Routes, Route } from "react-router-dom";

const meta: Meta<typeof QRouter> = {
  title: "Routing/QRouter",
  component: QRouter,
};

export default meta;
type Story = StoryObj<typeof QRouter>;

export const Default: Story = {
  render: () => (
    <QRouter>
      <div style={{ padding: "2rem" }}>
        <h2>🌀 QRouter Demo</h2>
        <p>This story demonstrates dynamic quantum routing.</p>
        <p>
          Try navigating to <Link to="/hello">/hello</Link> or{" "}
          <Link to="/world">/world</Link>.
        </p>
        <Routes>
          <Route path="/hello" element={<div>Hello Quantum 🌐</div>} />
          <Route path="/world" element={<div>World Quantum ⚛️</div>} />
        </Routes>
      </div>
    </QRouter>
  ),
};