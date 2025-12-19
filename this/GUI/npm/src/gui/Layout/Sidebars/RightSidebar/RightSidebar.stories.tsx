import { StoryFn } from "@storybook/react";
import React from "react";
import Layout from "@/gui/Layout/Layout";
import ThemeModeToggle from "@/gui/Theme/ToggleMode/ToggleMode";
export default {
  title: "GUI/Layout/RightSidebar",
  component: Layout,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
`The **RightSidebar** component mirrors the LeftSidebar experience on the opposite edge of the screen. Use it for complementary tools, contextual insights, and secondary actions without losing alignment with the primary content area.
---
## Features
- **Rail-first orientation:** Defaults to a compact 72px rail so charts or documents remain visible.
- **Expandable workspace:** Switch to a wide panel (264px) for verbose content, filters, or inspectors.
- **Mobile-friendly drawer:** On small screens it becomes a temporary drawer that slides over content from the right.
- **Footer actions:** Accepts \`footerElements\` so pinned tools (settings, help) stay reachable.
- **Inset synchronization:** Updates \`theme.layout.insets.right\` so TopBar and other surfaces adapt automatically.

---
## Layout Modes
- \`rail\`: icon-only column hugging the right edge.
- \`expanded\`: full-width tools panel with labels and nested menus.
- \`mobile\`: overlay drawer controlled by a floating button.
Modes can be toggled programmatically via \`useRightSidebar()\` or automatically through built-in breakpoints.

---
## Props
- \`elements?: RightSidebarElement[]\` — Declarative items (\`link\`, \`menu\`, \`action\`) rendered in order.
- \`footerElements?: RightSidebarElement[]\` — Optional sticky footer actions.
- \`initialView?: 'rail' | 'expanded' | 'mobile'\` — Starting mode (defaults to \`rail\`).
- \`className?\` and other DOM props are forwarded to the root \`aside\`.

---
## Declarative usage
~~~tsx
import RightSidebar from '@/gui/Layouts/ResponsiveUI/Sidebars/RightSidebar/RightSidebar';

<RightSidebar
  elements={[
    { type: 'link', props: { label: 'Notifications', icon: 'notifications' } },
    { type: 'link', props: { label: 'Activity', icon: 'history' } },
    {
      type: 'menu',
      props: {
        label: 'Views',
        icon: 'view_cozy',
        items: [
          { label: 'Timeline', icon: 'timeline' },
          { label: 'JSON', icon: 'code' },
        ],
      },
    },
  ]}
  footerElements={[
    { type: 'link', props: { label: 'Settings', icon: 'settings' } },
    { type: 'action', props: { label: 'Support', icon: 'help' } },
  ]}
/>;
~~~

---
## React usage
Combine the context provider and hook to manage the view explicitly:
~~~tsx
import { RightSidebarProvider } from '@/gui/contexts';
import { useRightSidebar } from '@/gui/hooks';
import RightSidebar from '@/gui/Layouts/ResponsiveUI/Sidebars/RightSidebar/RightSidebar';

const items = [{ type: 'link', props: { label: 'History', icon: 'history' } }];

function Inspector() {
  const { view, setView } = useRightSidebar();
  return (
    <>
      <button onClick={() => setView(view === 'expanded' ? 'rail' : 'expanded')}>
        Toggle inspector
      </button>
      <RightSidebar elements={items} />
    </>
  );
}

export function InspectorShell() {
  return (
    <RightSidebarProvider>
      <Inspector />
    </RightSidebarProvider>
  );
}
~~~

---
## Notes
- The floating toggle only appears in mobile mode; closing the drawer restores the underlying layout insets.
- Footer elements share the same declarative shape as main items, so you can reuse links or action buttons.
- Works seamlessly alongside \`LeftSidebar\` and \`TopBar\` when using the responsive Layout shell.
`,
      },
    },
  },
};

const Template: StoryFn<React.ComponentProps<typeof Layout>> = (args) => (
  <Layout {...args} />
);

export const Default = Template.bind({});
Default.args = {
  topBarConfig: {
    title: "Analytics",
    elementsRight: [
      {
        type: "action",
        props: {
          element: <ThemeModeToggle variant="minimal" show="icons" iconSize="small" />,
        },
      },
      { type: "action", props: { label: "Share", icon: "ios_share", iconColor: "var(--gui-primary)" } },
    ],
  },
  rightSidebarConfig: {
    elements: [
      { type: "link", props: { label: "Notifications", icon: "notifications", iconColor: "var(--gui-warning)" } },
      { type: "link", props: { label: "Activity", icon: "history", iconColor: "var(--gui-secondary)" } },
      {
        type: "menu",
        props: {
          label: "Views",
          icon: "view_cozy",
          iconColor: "var(--gui-primary)",
          items: [
            { label: "Timeline", icon: "timeline", iconColor: "var(--gui-success)" },
            { label: "JSON", icon: "code", iconColor: "var(--gui-info)" },
          ],
        },
      },
      { type: "action", props: { label: "Download", icon: "download", iconColor: "var(--gui-primary)" } },
    ],
  },
};

export const WithFooter = Template.bind({});
WithFooter.args = {
  topBarConfig: {
    title: "Analytics",
    elementsRight: [
      {
        type: "action",
        props: {
          element: <ThemeModeToggle variant="minimal" show="icons" iconSize="small" />,
        },
      },
      { type: "action", props: { label: "Share", icon: "ios_share", iconColor: "var(--gui-primary)" } },
    ],
  },
  rightSidebarConfig: {
    elements: [
      { type: "link", props: { label: "Notifications", icon: "notifications", iconColor: "var(--gui-warning)" } },
      { type: "link", props: { label: "Activity", icon: "history", iconColor: "var(--gui-secondary)" } },
      {
        type: "menu",
        props: {
          label: "Views",
          icon: "view_cozy",
          iconColor: "var(--gui-primary)",
          items: [
            { label: "Timeline", icon: "timeline", iconColor: "var(--gui-success)" },
            { label: "JSON", icon: "code", iconColor: "var(--gui-info)" },
          ],
        },
      },
      { type: "action", props: { label: "Download", icon: "download", iconColor: "var(--gui-primary)" } },
    ],
    footerElements: [
      { type: "link", props: { label: "Settings", icon: "settings", iconColor: "var(--gui-secondary)" } },
      { type: "action", props: { label: "Support", icon: "help", iconColor: "var(--gui-success)" } },
    ],
  },
};

export const WithBothSidebars = Template.bind({});
WithBothSidebars.args = {
  topBarConfig: {
    title: "Analytics",
    elementsRight: [
      {
        type: "action",
        props: {
          element: <ThemeModeToggle variant="minimal" show="icons" iconSize="small" />,
        },
      },
      { type: "action", props: { label: "Share", icon: "ios_share", iconColor: "var(--gui-primary)" } },
    ],
  },
  leftSidebarConfig: {
    elements: [
      { type: "link", props: { label: "Dashboard", icon: "dashboard", iconColor: "var(--gui-primary)" } },
      {
        type: "menu",
        props: {
          label: "Projects",
          icon: "folder",
          iconColor: "var(--gui-secondary)",
          items: [
            { label: "Project A", icon: "folder_open" },
            { label: "Project B", icon: "folder_open" },
          ],
        },
      },
      { type: "action", props: { label: "Create", icon: "add_circle", iconColor: "var(--gui-success)" } },
    ],
    footerElements: [
      { type: "link", props: { label: "Settings", icon: "settings", iconColor: "var(--gui-secondary)" } },
      { type: "action", props: { label: "Help", icon: "help_outline", iconColor: "var(--gui-info)" } },
    ],
  },
  rightSidebarConfig: {
    elements: [
      { type: "link", props: { label: "Notifications", icon: "notifications", iconColor: "var(--gui-warning)" } },
      { type: "link", props: { label: "Activity", icon: "history", iconColor: "var(--gui-secondary)" } },
      {
        type: "menu",
        props: {
          label: "Views",
          icon: "view_cozy",
          iconColor: "var(--gui-primary)",
          items: [
            { label: "Timeline", icon: "timeline", iconColor: "var(--gui-success)" },
            { label: "JSON", icon: "code", iconColor: "var(--gui-info)" },
          ],
        },
      },
      { type: "action", props: { label: "Download", icon: "download", iconColor: "var(--gui-primary)" } },
    ],
  },
};
