import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import Namespace from "./Namespace";
import Theme from "@/gui/Theme/Theme";

function withPath(path: string) {
  return (Story: any) => {
    // If Storybook (or your preview) already wraps stories in a Router,
    // we must NOT render another Router here.
    // Pushing a new history state is enough for BrowserRouter to pick up the path.
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", path);
    }
    return <Story />;
  };
}

const meta: Meta<typeof Namespace> = {
  title: "Namespace/Namespace",
  component: Namespace,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
The **Namespace** component is a tiny route resolver used inside the This.GUI layout shell.
It reads the current URL **pathname** and decides which **namespace view** to render.

---
## What it does
- Uses React Router (\`useLocation()\`) to read the current path.
- Displays a simple **Unknown namespace** fallback that reflects the current pathname.
- Useful as a placeholder outlet while namespace routing is being designed.

---
## When to use
- As an internal “outlet” for layout shells that want to map namespaces/paths to organism-level views.
- In Storybook to quickly test how new namespaces resolve without wiring a full app router.

---
## Notes
- These stories assume Storybook (or your app shell) already provides a Router. The story uses \`window.history.pushState\` to simulate navigation.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Namespace>;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <Theme>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </Theme>
  );
}

export const RootNamespace: Story = {
  decorators: [withPath("/")],
  render: () => (
    <Shell>
      <Namespace />
    </Shell>
  ),
};

export const VisorNamespace: Story = {
  decorators: [withPath("/visor")],
  render: () => (
    <Shell>
      <Namespace />
    </Shell>
  ),
};

export const VisorNamespaceDeepPath: Story = {
  name: "Visor (deep path)",
  decorators: [withPath("/visor/room/AB12CD")],
  render: () => (
    <Shell>
      <Namespace />
    </Shell>
  ),
};

export const UnknownNamespace: Story = {
  decorators: [withPath("/something/else")],
  render: () => (
    <Shell>
      <Namespace />
    </Shell>
  ),
};
