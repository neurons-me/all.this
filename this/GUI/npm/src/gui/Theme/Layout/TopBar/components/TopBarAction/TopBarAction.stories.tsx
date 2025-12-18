import type { Meta, StoryObj } from '@storybook/react';
import TopBarAction from './TopBarAction';
import Icon from '@/gui/Theme/Icon/Icon';

const meta: Meta<typeof TopBarAction> = {
  title: 'Layout/TopBar/TopBarAction',
  component: TopBarAction,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
The **TopBarAction** component is a simple wrapper designed for placing interactive or visual elements (like icons, buttons, or toggles) inside the TopBar.

It standardizes alignment, spacing, and styling for small atomic actions in the top navigation area.

---

### 🧩 Features
- Wraps any ReactNode element inside a styled container.
- Accepts custom \`className\` and \`style\` props for styling flexibility.
- Commonly used to host action icons, buttons, or mini components in the TopBar.

---

### ⚙️ Props
| Name | Type | Default | Description |
|------|------|----------|-------------|
| \`element\` | \`ReactNode\` | — | The element to render inside the TopBar action slot. |
| \`className?\` | \`string\` | — | Optional class name for extra styling. |
| \`style?\` | \`React.CSSProperties\` | — | Inline style overrides. |

---

### 🧠 Behavior
TopBarAction is purely structural — it doesn’t manage state or events.
It ensures consistent alignment and padding so that icons or buttons within the TopBar remain visually balanced.

---

### 🧩 Example Usage

#### React
~~~tsx
import TopBarAction from '@/gui/Layouts/TopBar/TopBarAction';
import Icon from '@/themes/Icon/Icon';

export const Example = () => (
  <div style={{ display: 'flex', gap: '1rem' }}>
    <TopBarAction element={<Icon name="notifications" />} />
    <TopBarAction element={<Icon name="settings" iconColor="#1976d2" />} />
    <TopBarAction element={<button>Click me</button>} />
  </div>
);
~~~

#### Declarative JSON
~~~json
{
  "type": "TopBarAction",
  "props": {
    "element": {
      "type": "Icon",
      "props": { "name": "notifications" }
    },
    "style": { "marginRight": "8px" }
  }
}
~~~
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TopBarAction>;

export const Playground: Story = {
  args: {
    element: <Icon name="notifications" />,
  },
};