import { StoryFn } from "@storybook/react";
import React from "react";
import Layout from "@/gui/Layout/Layout";
import ThemeModeToggle from "@/gui/Theme/ToggleMode/ToggleMode";

export default {
  title: "GUI/Layout/LeftSidebar",
  component: Layout,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
`The **LeftSidebar** component provides the navigation rail for ResponsiveUI layouts. It keeps content aligned with other structural elements (TopBar, RightSidebar) while offering a consistent spot for primary navigation and quick actions.
---
## Features
- **Rail-first layout:** Starts in rail view by default to maximize canvas space while keeping icons reachable.
- **Expanded navigation:** Users can switch to an expanded width for descriptive labels and nested menus.
- **Mobile overlay:** On compact viewports it becomes a temporary drawer that overlays content and releases the left inset.
- **Footer actions:** Optional \`footerElements\` allow secondary actions (e.g. settings, help) that stay pinned to the bottom.
- **Inset sync:** Updates \`theme.layout.insets.left\` so surrounding layouts and the TopBar shift automatically.

---
## Layout Variants
- \`rail\`: 72px icon rail, best for dense productivity layouts.
- \`expanded\`: 264px panel with labels and nested menu support.
- \`mobile\`: Drawer that covers the screen content and is controlled by a floating toggle button.
The sidebar transitions between these modes automatically based on breakpoints, but you can also set them manually via \`useLeftSidebar()\`.

---
## Props
- \`elements: LeftSidebarElement[]\` — Main navigation items. Supports \`link\`, \`menu\`, and \`action\` types.
- \`footerElements?: LeftSidebarElement[]\` — Optional persistent actions rendered in the footer.
- \`initialView?: 'rail' | 'expanded' | 'mobile'\` — Starting layout; defaults to \`rail\`.
- \`className?, ...rest\` — Standard layout props forwarded to the root container.

---
## Declarative usage
~~~tsx
import LeftSidebar from '@/gui/Layouts/ResponsiveUI/Sidebars/LeftSidebar/LeftSidebar';

<LeftSidebar
  initialView="rail"
  elements={[
    { type: 'link', props: { label: 'Dashboard', icon: 'dashboard' } },
    { type: 'link', props: { label: 'Analytics', icon: 'bar_chart' } },
    {
      type: 'menu',
      props: {
        label: 'Projects',
        icon: 'folder',
        items: [
          { label: 'Active', icon: 'task' },
          { label: 'Archive', icon: 'inventory_2' },
        ],
      },
    },
  ]}
  footerElements={[
    { type: 'link', props: { label: 'Settings', icon: 'settings' } },
    { type: 'action', props: { label: 'Sign out', icon: 'logout' } },
  ]}
/>;
~~~

---
## React usage
Wrap your layout with \`LeftSidebarProvider\` and consume \`useLeftSidebar()\` to control the view programmatically:
~~~tsx
import { LeftSidebarProvider } from '@/gui/contexts';
import LeftSidebar from '@/gui/Layouts/ResponsiveUI/Sidebars/LeftSidebar/LeftSidebar';
import { useLeftSidebar } from '@/gui/hooks';

const navItems = [
  { type: 'link', props: { label: 'Dashboard', icon: 'dashboard' } },
  { type: 'link', props: { label: 'Billing', icon: 'receipt_long' } },
];

function Shell() {
  const { view, setView } = useLeftSidebar();
  return (
    <>
      <button onClick={() => setView(view === 'expanded' ? 'rail' : 'expanded')}>
        Toggle mode
      </button>
      <LeftSidebar elements={navItems} />
    </>
  );
}

export function AppShell() {
  return (
    <LeftSidebarProvider>
      <Shell />
    </LeftSidebarProvider>
  );
}
~~~

---
## Notes
- Mobile mode is triggered automatically below the \`sm\` breakpoint; the floating toggle re-opens the drawer.
- The sidebar updates the global inset each time the view changes, keeping the TopBar and page content aligned.
- Combine with the \`TopBar\` story to see how the two components cooperate in responsive layouts.
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
    title: "My Application",
    elementsRight: [
      { type: "link", props: { label: "Profile", icon: "account_circle" } },
      {
        type: "action",
        props: {
          element: <ThemeModeToggle variant="minimal" show="icons" iconSize="small" />,
        },
      },
      { type: "action", props: { label: "Logout", icon: "logout", iconColor: "var(--gui-error)" } },
    ],
  },
  leftSidebarConfig: {
    elements: [
      { type: "link", props: { label: "Dashboard", icon: "dashboard", iconColor: "var(--gui-primary)" } },
      { type: "link", props: { label: "Analytics", icon: "bar_chart", iconColor: "var(--gui-secondary)" } },
      {
        type: "menu",
        props: {
          label: "Projects",
          icon: "folder",
          iconColor: "var(--gui-warning)",
          items: [
            { label: "Project A", icon: "work", iconColor: "var(--gui-success)" },
            { label: "Project B", icon: "assignment", iconColor: "var(--gui-info)" },
          ],
        },
      },
      { type: "action", props: { label: "Logout", icon: "logout", iconColor: "var(--gui-error)", action: "handleLogout" } },
    ],
  },
};

export const WithoutTopBar = Template.bind({});
WithoutTopBar.args = {
  leftSidebarConfig: {
    elements: [
      { type: "link", props: { label: "Dashboard", icon: "dashboard", iconColor: "var(--gui-primary)" } },
      { type: "link", props: { label: "Analytics", icon: "bar_chart", iconColor: "var(--gui-secondary)" } },
      {
        type: "menu",
        props: {
          label: "Projects",
          icon: "folder",
          iconColor: "var(--gui-warning)",
          items: [
            { label: "Project A", icon: "work", iconColor: "var(--gui-success)" },
            { label: "Project B", icon: "assignment", iconColor: "var(--gui-info)" },
          ],
        },
      },
      { type: "action", props: { label: "Logout", icon: "logout", iconColor: "var(--gui-error)", action: "handleLogout" } },
    ],
  },
};

export const WithFooter = Template.bind({});
WithFooter.args = {
  leftSidebarConfig: {
    elements: [
      { type: "link", props: { label: "Dashboard", icon: "dashboard", iconColor: "var(--gui-primary)" } },
      { type: "link", props: { label: "Analytics", icon: "bar_chart", iconColor: "var(--gui-secondary)" } },
      {
        type: "menu",
        props: {
          label: "Projects",
          icon: "folder",
          iconColor: "var(--gui-warning)",
          items: [
            { label: "Project A", icon: "work", iconColor: "var(--gui-success)" },
            { label: "Project B", icon: "assignment", iconColor: "var(--gui-info)" },
          ],
        },
      },
      { type: "action", props: { label: "Logout", icon: "logout", iconColor: "var(--gui-error)", action: "handleLogout" } },
    ],
    footerElements: [
      { type: "link", props: { label: "Settings", icon: "settings", iconColor: "var(--gui-primary)" } },
      { type: "action", props: { label: "Help", icon: "help", iconColor: "var(--gui-success)" } },
    ],
  },
};
