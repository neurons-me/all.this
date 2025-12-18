/**
 * ## TopBarLink Component
 *
 * `TopBarLink` represents an individual navigation link for the TopBar.
 * It supports icons, color customization, and responsive label visibility.
 *
 * ---
 *
 * ### 🧩 Props
 *
 * | Prop         | Type        | Description |
 * |---------------|-------------|-------------|
 * | `label`       | `string`    | The text displayed next to the icon. |
 * | `href`        | `string`    | The target URL or route. |
 * | `icon`        | `string?`   | Optional icon name from the `Icon` component (Material Symbols). |
 * | `iconColor`   | `string?`   | Optional custom color for the icon (defaults to `currentColor`). |
 * | `external`    | `boolean?`  | If true, opens the link in a new tab (`target="_blank"`). |
 * | `showLabel`   | `boolean?`  | Determines whether to show the label (used for responsive collapse). Defaults to `true`. |
 *
 * ---
 *
 * ### 💡 Responsive Behavior
 *
 * The `TopBarLink` component automatically adapts to screen size:
 *
 * | Viewport | Behavior |
 * |-----------|-----------|
 * | **Desktop (≥900px)** | Shows icon + label. |
 * | **Tablet (600–899px)** | Shows only icons (`showLabel = false`). |
 * | **Mobile (<600px)** | Collapsed within grouped menus (managed by `TopBar`). |
 *
 * In mobile view, individual `TopBarLink` components are typically grouped under a collapsed menu icon (such as `settings` or `more_horiz`), handled by the TopBar responsiveness system.
 *
 * ---
 *
 * ### 📘 Examples
 * - `Basic` → Simple text link.
 * - `WithIcon` → Link with an icon.
 * - `IconOnly` → Icon-only mode (used for tablet responsiveness).
 * - `ExternalLink` → Opens an external page in a new tab.
 * - `ColoredIcon` → Example with custom icon color.
 */
import type { Meta, StoryObj } from '@storybook/react';
import TopBarLink from './TopBarLink';
// ======================= Meta =======================
const meta: Meta<typeof TopBarLink> = {
  title: 'Layout/TopBar/TopBarLink',
  component: TopBarLink,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
The **TopBarLink** component represents an individual link or navigation item inside the TopBar.
It supports icons, color customization, and responsive label visibility.

---

## Features
- Displays a **label**, **icon**, or both depending on viewport size.
- Automatically adapts to screen width through responsive breakpoints.
- External links open in a new tab when \`external = true\`.
- The label visibility can be controlled with the \`showLabel\` prop for tablet responsiveness.
- Works seamlessly with **TopBar** to handle desktop, tablet, and mobile layouts.

---

## Responsiveness
The \`TopBarLink\` automatically adapts to viewport width using MUI's breakpoints:

| Viewport | Range | Behavior |
|-----------|--------|-----------|
| **Desktop** | ≥ 900px | Shows icon + label |
| **Tablet** | 600–899px | Shows icons only (label hidden) |
| **Mobile** | < 600px | Included in collapsed TopBar menu |

---

## Key Props
| Prop | Type | Description |
|------|------|-------------|
| \`label\` | \`string\` | The text shown beside the icon. |
| \`href\` | \`string\` | The URL or route the link navigates to. |
| \`icon\` | \`string\` | Material icon name. Optional. |
| \`iconColor\` | \`string\` | Custom icon color. Defaults to \`currentColor\`. |
| \`external\` | \`boolean\` | Opens the link in a new tab if true. |
| \`showLabel\` | \`boolean\` | Controls label visibility (used in responsive layouts). |

---

### Basic usage (React)
~~~tsx
import TopBarLink from '@/gui/Layouts/TopBar/TopBarLink';

<TopBarLink label="Home" href="/" icon="home" />
~~~

---
### In a responsive TopBar
~~~tsx
<TopBar
  title="neurons.me"
  elementsRight={[
    { type: 'link', props: { label: 'Home', href: '/', icon: 'home' } },
    { type: 'link', props: { label: 'Settings', href: '/settings', icon: 'settings' } }
  ]}
/>
~~~

---

## Declarative JSON / Config usage
The **TopBarLink** can also be described declaratively within a resolver-driven UI definition.

### 🧩 Example usage

#### React
~~~tsx
import TopBarLink from '@/gui/Layouts/TopBar/TopBarLink';

export const Example = () => (
  <div style={{ display: 'flex', gap: '1rem' }}>
    <TopBarLink label="Home" href="/" icon="home" />
    <TopBarLink label="Profile" href="/profile" icon="person" />
    <TopBarLink label="Settings" href="/settings" icon="settings" iconColor="#1976d2" />
  </div>
);
~~~

#### Declarative JSON
~~~json
{
  "type": "TopBar",
  "props": {
    "title": "neurons.me",
    "elementsRight": [
      { "type": "TopBarLink", "props": { "label": "Home", "href": "/", "icon": "home" } },
      { "type": "TopBarLink", "props": { "label": "Profile", "href": "/profile", "icon": "person" } },
      { "type": "TopBarLink", "props": { "label": "Settings", "href": "/settings", "icon": "settings", "iconColor": "#1976d2" } }
    ]
  }
}
~~~
        `,
      },
    },
  },
  argTypes: {
    label: { control: 'text', description: 'Text label displayed next to the icon.' },
    href: { control: 'text', description: 'URL or route target.' },
    icon: { control: 'text', description: 'Material icon name (string).' },
    iconColor: { control: 'color', description: 'Custom icon color.' },
    external: { control: 'boolean', description: 'Open link in new tab if true.' },
    showLabel: { control: 'boolean', description: 'Determines label visibility.' },
  },
  args: {
    label: 'Home',
    href: '/',
    icon: 'home',
    iconColor: 'currentColor',
    external: false,
    showLabel: true,
  },
};

export default meta;

type Story = StoryObj<typeof TopBarLink>;

// ======================= Stories =======================
export const Basic: Story = {
  args: { label: 'Home', href: '/' },
};

export const WithIcon: Story = {
  args: { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
};

export const IconOnly: Story = {
  args: { label: 'Profile', href: '/profile', icon: 'person', showLabel: false },
};

export const ExternalLink: Story = {
  args: { label: 'GitHub', href: 'https://github.com', external: true, icon: 'code' },
};

export const ColoredIcon: Story = {
  args: { label: 'Settings', href: '/settings', icon: 'settings', iconColor: '#1976d2' },
};