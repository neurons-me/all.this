import type { Meta, StoryObj } from "@storybook/react";
import Footer from "./Footer";
import Layout from "@/gui/Layout/Layout";
import ThemeModeToggle from '@/gui/Theme/ToggleMode/ToggleMode';

const meta: Meta<typeof Footer> = {
  title: "GUI/Layout/Footer",
  component: Footer,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
`The **Footer** component serves as a foundational UI element that anchors actions and secondary navigation at the bottom of the viewport, while seamlessly integrating with responsive layouts and respecting insets caused by sidebars and other layout elements.

---
## Declarative Usage
You can declare the Footer directly in JSX by passing branding information and arrays of elements for the left, center, and right zones. Each element can be a link or an action, allowing flexible customization of navigation and controls.

---
## Responsive React Layout Integration
The Footer automatically adjusts its width and position based on the presence of left and right sidebars, ensuring it does not overlap with other UI components. It also adapts to different screen sizes by hiding labels on tablet and mobile views, showing only icons with tooltips for accessibility.

---
## Props Overview
- \`brandLabel\`: Text label representing the brand, used as fallback or alongside the logo.
- \`brandLogo\`: URL or path to the brand logo image.
- \`brandHref\`: Link URL for the brand element, typically the home page.
- \`leftElements\`, \`centerElements\`, \`rightElements\`: Arrays of elements defining the content for each segment of the footer. Each element is an object with a \`type\` ('link' or 'action') and \`props\` defining its properties such as label, icon, href, and event handlers.

---
## Features
- **Inset-aware:** Automatically offsets its width to accommodate left and right sidebars, avoiding overlap.
- **Responsive Design:** Collapses labels to icons only on smaller screens, maintaining usability and accessibility with tooltips.
- **Segmented Layout:** Divides the footer into three distinct zones (left, center, right) for organized content placement.
- **Flexible Positioning:** Supports \`static\`, \`fixed\`, and \`sticky\` positioning modes to suit various layout needs.
- **Customizable Styling:** Allows style overrides via \`sx\`, \`appBarSx\`, and \`sectionSx\` for fine-grained control.

---
## Layout Zones
- **Left Zone:** Typically contains branding and primary links.
- **Center Zone:** Ideal for documentation links, community resources, or other central navigation.
- **Right Zone:** Often used for actions such as theme toggles or contact buttons.

---
## Responsiveness
Below the \`md\` breakpoint, the Footer hides text labels and displays only icons, preserving space and clarity on smaller devices. Tooltips are provided to maintain accessibility despite the reduced label visibility.

---
## Integration Tips
- Combine the Footer with responsive layout shells that include TopBar and Sidebars to maintain consistent insets and layout harmony.
- Use the \`position="fixed"\` prop to create persistent footers that remain visible and update the global bottom inset dynamically.
- Leverage the segmented layout to organize navigation and actions intuitively.

---
## Example: Declarative Usage
~~~tsx
<Footer
  brandLabel="Neuroverse"
  brandLogo="/logo.svg"
  leftElements={[
    { type: 'link', props: { label: 'Changelog', icon: 'history', href: '/changelog' } },
  ]}
  centerElements={[
    { type: 'link', props: { label: 'Docs', icon: 'menu_book', href: '/docs' } },
    { type: 'link', props: { label: 'Community', icon: 'forum', href: '/community', external: true } },
  ]}
  rightElements={[
    { type: 'action', props: { label: 'Toggle Theme', icon: 'dark_mode', onClick: toggleMode } },
  ]}
/>
~~~

---
## Example: React Integration with Layout
~~~tsx
<Layout
  topBarConfig={{
    title: "Responsive Shell",
    elementsRight: [
      {
        type: "action",
        props: {
          element: <ThemeModeToggle variant="minimal" show="icons" iconSize="small" />,
        },
      },
    ],
  }}
  leftSidebarConfig={{
    elements: [
      { type: "link", props: { label: "Overview", icon: "dashboard", iconColor: "var(--gui-primary)" } },
      { type: "link", props: { label: "Reports", icon: "insights", iconColor: "var(--gui-secondary)" } },
    ],
  }}
  rightSidebarConfig={{
    elements: [
      { type: "link", props: { label: "Alerts", icon: "notifications", iconColor: "var(--gui-warning)" } },
      { type: "action", props: { label: "Export", icon: "download", iconColor: "var(--gui-success)" } },
    ],
  }}
  footerConfig={{
    title: "Neuroverse",
    logoSrc: "/logo.svg",
    links: [
      { name: "Docs", url: "/docs", icon: "menu_book" },
      { name: "API", url: "/api", icon: "code" },
    ],
    socialLinks: [
      { name: "GitHub", url: "https://github.com", icon: "code" },
      { name: "Community", url: "https://community.neuroverse.ai", icon: "forum" },
    ],
    position: "fixed",
  }} 
>
  {/* Main content goes here */}
</Layout>
~~~
`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const Default: Story = {
  args: {
    brandLabel: "Neuroverse",
    brandLogo: "https://neurons.me/neurons.me.png",
    brandHref: "/",
    leftElements: [
      { type: "link", props: { label: "Status", icon: "monitor_heart", href: "/status", iconColor: "var(--gui-info)" } },
      { type: "link", props: { label: "Changelog", icon: "history", href: "/changelog", iconColor: "var(--gui-warning)" } },
    ],
    centerElements: [
      { type: "link", props: { label: "Docs", icon: "menu_book", href: "/docs", iconColor: "var(--gui-primary)" } },
      { type: "link", props: { label: "Community", icon: "forum", href: "https://community.neuroverse.ai", external: true, iconColor: "var(--gui-secondary)" } },
    ],
    rightElements: [
      { type: "action", props: { label: "Contact", icon: "support_agent", iconColor: "var(--gui-success)" } },
      { type: "action", props: { label: "Theme", icon: "dark_mode", iconColor: "var(--gui-primary)" } },
    ],
    position: "static",
  },
};

export const FixedFooter: Story = {
  args: {
    ...Default.args,
    position: "fixed",
  },
};

export const WithLayout: Story = {
  render: () => (
    <Layout
      topBarConfig={{
        title: "Responsive Shell",
        elementsRight: [
          {
            type: "action",
            props: {
              element: <ThemeModeToggle variant="minimal" show="icons" iconSize="small" />,
            },
          },
        ],
      }}
      leftSidebarConfig={{
        elements: [
          { type: "link", props: { label: "Overview", icon: "dashboard", iconColor: "var(--gui-primary)" } },
          { type: "link", props: { label: "Reports", icon: "insights", iconColor: "var(--gui-secondary)" } },
        ],
      }}
      rightSidebarConfig={{
        elements: [
          { type: "link", props: { label: "Alerts", icon: "notifications", iconColor: "var(--gui-warning)" } },
          { type: "action", props: { label: "Export", icon: "download", iconColor: "var(--gui-success)" } },
        ],
      }}
      footerConfig={ {
        title: "Neuroverse",
        logoSrc: "https://neurons.me/neurons.me.png",
        links: [
          { name: "Docs", url: "/docs", icon: "menu_book" },
          { name: "API", url: "/api", icon: "code" },
        ],
        socialLinks: [
          { name: "GitHub", url: "https://github.com", icon: "code" },
          { name: "Community", url: "https://community.neuroverse.ai", icon: "forum" },
        ],
        position: "fixed",
      } as any}
    >
      <div style={{ minHeight: '120vh', padding: '72px 24px 120px' }}>
        <h2 style={{ marginBottom: 16 }}>Dashboard Content</h2>
        <p>
          Resize the viewport to see how the TopBar, LeftSidebar, RightSidebar, and Footer coordinate
          their insets. The footer collapses labels below the medium breakpoint while keeping icons and
          tooltips.
        </p>
      </div>
    </Layout>
  ),
};
