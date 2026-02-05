import React from 'react';
import type { Meta, StoryFn, StoryObj } from '@storybook/react';
import Layout from './Layout';
import Page from '@/gui/molecules/Page/Page';
import { Box, Typography } from '@/gui/atoms';
import ThemeModeToggle from '@/gui/Theme/ToggleMode/ToggleMode';
const meta: Meta<typeof Layout> = {
  title: "GUI/Layout",
  component: Layout,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
The **Layout** component wires the responsive shell used across This.GUI demos. It coordinates the TopBar, left/right sidebars, and Footer so their insets remain in sync while your application content renders inside.
---
## Features
- **Context wiring** – wraps children with the required providers (LeftSidebar, RightSidebar) so hooks and insets work automatically.
- **Composable regions** – optional \`TopBar\`, \`LeftSideBar\`, \`RightSideBar\`, and \`Footer\` let you enable only what you need.
- **Inset aware** – whenever a sidebar expands or collapses, the layout updates theme insets so the TopBar/Footer and main content stay aligned.
- **Story-friendly** – serves as an orchestration helper in Storybook; in production you can lift the same pattern to your app shell.

---
## Declarative usage
~~~json
{
  "type": "Layout",
  "props": {
    "TopBar": {
      "title": "Workspace",
      "elementsRight": [
        {
          "type": "action",
          "props": {
            "element": "ThemeModeToggle"
          }
        }
      ]
    },
    "LeftSideBar": {
      "elements": [
        {
          "type": "link",
          "props": {
            "label": "Dashboard",
            "icon": "dashboard"
          }
        },
        {
          "type": "menu",
          "props": {
            "label": "Projects",
            "icon": "folder",
            "items": [
              {
                "label": "Project A",
                "icon": "work"
              },
              {
                "label": "Project B",
                "icon": "assignment"
              }
            ]
          }
        }
      ]
    },
    "RightSideBar": { "elements": [] },
    "Footer": {
      "brandLabel": "Neuroverse",
      "centerElements": [
        {
          "type": "link",
          "props": {
            "label": "Docs",
            "href": "/docs",
            "icon": "menu_book"
          }
        }
      ]
    }
  },
  "Content": [
    {
      "children": [
        {
          "type": "Section",
          "props": {
            "title": "Overview"
          }
        },
        {
          "type": "Card",
          "props": {
            "title": "AI Metrics"
          }
        }
      ]
    }
  ]
}
~~~

---
## React usage
Use the layout as a shell around your routes or dashboard pages. Pass config objects when you need a region; use \`false\` to omit it.
~~~tsx
function DashboardPage() {
  return (
    <Layout
      TopBar={{
        title: "Analytics",
        elementsRight: [
          { type: "action", props: { element: <ThemeModeToggle variant="minimal" /> } },
        ],
      }}
      LeftSideBar={{
        elements: [
          { type: "link", props: { label: "Overview", icon: "home" } },
          { type: "link", props: { label: "Reports", icon: "insights" } },
        ],
      }}
      RightSideBar={{
        elements: [
          { type: "link", props: { label: "Alerts", icon: "notifications" } },
        ],
      }}
    >
      <Outlet />
    </Layout>
  );
}
~~~

---
## Notes
- Props objects mirror the props of the individual components (TopBar, LeftSidebar, RightSidebar, Footer). (Legacy \`*Config\` props are still supported.)
- Set a config to \`false\` (or omit it) to exclude that region entirely.
- Children render in document order beneath any enabled sidebars/top bar – for sticky layouts remember to add padding or section containers as shown below.
`,
      },
    },
  },
  argTypes: {
    TopBar: { control: 'object' },
    LeftSideBar: { control: 'object' },
    RightSideBar: { control: 'object' },
    Footer: { control: 'object' },
  },
};

export default meta;

const Template: StoryFn<React.ComponentProps<typeof Layout>> = (args) => (
  <Layout {...args}>
    <Box
      sx={{
        minHeight: '120vh',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        Responsive Layout Demo
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720 }}>
        Resize the viewport or toggle sidebars to observe how insets are coordinated.
        This content is intentionally tall to show how fixed bars interact with scrolling.
      </Typography>

      <Box
        sx={{
          mt: 1,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            Insets-aware
          </Typography>
          <Typography variant="caption" color="text.secondary">
            This block uses theme tokens and lets Layout/Content handle spacing.
          </Typography>
        </Box>
        <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            Sidebar coordination
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Expand/collapse sidebars and confirm content stays aligned.
          </Typography>
        </Box>
        <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            Scroll behavior
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Layout keeps the main area scrollable without manual padding hacks.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        {Array.from({ length: 18 }).map((_, i) => (
          <Typography key={i} variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Row {i + 1} — filler content to demonstrate scrolling within the Layout content area.
          </Typography>
        ))}
      </Box>
    </Box>
  </Layout>
);

type Story = StoryObj<typeof Layout>;

export const TopOnly: Story = {
  render: Template,
  args: {
    TopBar: {
      title: "Neuroverse",
      elementsRight: [
        {
          type: "action",
          props: {
            element: <ThemeModeToggle variant="minimal" show="icons" iconSize="small" />,
          },
        },
      ],
    },
    LeftSideBar: false,
    RightSideBar: false,
    Footer: false,
  },
};

export const TopWithLeftSidebar: Story = {
  render: Template,
  args: {
    ...TopOnly.args,
    LeftSideBar: {
      elements: [
        { type: "link", props: { label: "Overview", icon: "dashboard" } },
        {
          type: "menu",
          props: {
            label: "Projects",
            icon: "folder",
            items: [
              { label: "Project Alpha", icon: "work" },
              { label: "Project Beta", icon: "assignment" },
            ],
          },
        },
      ],
      footerElements: [
        { type: "link", props: { label: "Settings", icon: "settings" } },
      ],
    },
  },
};

export const TopWithLeftAndRight: Story = {
  render: Template,
  args: {
    ...TopWithLeftSidebar.args,
    RightSideBar: {
      elements: [
        { type: "link", props: { label: "Activity", icon: "history" } },
        { type: "action", props: { label: "Export", icon: "download" } },
      ],
    },
  },
};

export const FullShellWithFooter: Story = {
  render: Template,
  args: {
    ...TopWithLeftAndRight.args,
    Footer: {
      brandLabel: "Neuroverse",
      brandLogo: "https://neurons.me/neurons.me.png",
      centerElements: [
        { type: "link", props: { label: "Docs", href: "/docs", icon: "menu_book", iconColor: "var(--gui-primary)" } },
        { type: "link", props: { label: "API", href: "/api", icon: "code", iconColor: "var(--gui-secondary)" } },
      ],
      rightElements: [
        { type: "link", props: { label: "Community", href: "https://community.neuroverse.ai", icon: "forum", iconColor: "var(--gui-info)", external: true } },
        { type: "link", props: { label: "GitHub", href: "https://github.com", icon: "code", iconColor: "var(--gui-warning)", external: true } },
      ],
      position: "fixed",
    },
  },
};

export const ContentOnly: Story = {
  render: Template,
  args: {
    TopBar: false,
    LeftSideBar: false,
    RightSideBar: false,
    Footer: false,
  },
};


export const LayoutWithPage: Story = {
  render: () => (
    <Layout
      TopBar={{ title: 'Neuroverse Workspace' }}
      LeftSideBar={{
        elements: [
          { type: 'link', props: { label: 'Home', icon: 'home' } },
          { type: 'link', props: { label: 'Analytics', icon: 'insights' } },
        ],
      }}
      RightSideBar={{
        elements: [
          { type: 'link', props: { label: 'Chat', icon: 'chat' } },
        ],
      }}
      Footer={{
        brandLabel: 'Neuroverse',
        centerElements: [
          { type: 'link', props: { label: 'Docs', icon: 'menu_book' } },
        ],
      }}
    >
      <Page padding={4}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Page inside Layout
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720 }}>
          This example shows how a Page component can be used inside the responsive Layout,
          automatically adapting to inset updates from the TopBar, sidebars, and Footer.
        </Typography>
      </Page>
    </Layout>
  ),
};
