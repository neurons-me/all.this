import type { Meta, StoryObj } from '@storybook/react';
import IconButton from './IconButton';
import Icon from '@/gui/Theme/Icon/Icon';
const meta: Meta<typeof IconButton> = {
  title: 'Atoms/Forms & Inputs/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
        <div style={{ padding: 16, minHeight: 200 }}>
          <Story />
        </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
The **IconButton** atom is a thin wrapper around MUI's \`MuiIconButton\`, staying faithful to its API and polymorphism (\`component\`).

In **declarative** mode (resolver), you can pass an \`icon\` token (e.g., \`"lucide:menu"\`, \`"mui:Close"\`) and it will render through the Icon registry. You can also style the icon with \`iconSx\` while using \`sx\` for the button root.

---
## React usage
~~~jsx
<IconButton color="primary" size="medium" aria-label="open menu">
  <Icon name="lucide:menu" />
</IconButton>
~~~

## Declarative JSON / Resolver
~~~json
{
  "type": "IconButton",
  "props": {
    "color": "primary",
    "size": "medium",
    "icon": "lucide:menu",
    "sx": { "border": "1px solid", "borderColor": "divider" },
    "iconSx": { "opacity": 0.9 }
  }
}
~~~
        `,
      },
    },
    controls: {
      exclude: ['component', 'children'],
    },
  },
  argTypes: {
    color: {
      control: { type: 'select' },
      options: ['inherit', 'default', 'primary', 'secondary', 'success', 'error', 'info', 'warning'],
    },
    size: {
      control: { type: 'radio' },
      options: ['small', 'medium', 'large'],
    },
    edge: {
      control: { type: 'radio' },
      options: ['start', 'end', false],
    },
    disabled: { control: 'boolean' },
    sx: { control: 'object' },
  },
  args: {
    color: 'default',
    size: 'medium',
    edge: false,
    disabled: false,
    sx: {},
    children: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;
export const Playground: Story = {
  render: (args) => (
    <IconButton {...args} aria-label="menu">
      <Icon name="lucide:menu" />
    </IconButton>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      {(['default', 'primary', 'secondary', 'success', 'info', 'warning', 'error'] as const).map((c) => (
        <IconButton key={c} color={c} aria-label={c}>
          <Icon name="mui:Favorite" />
        </IconButton>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <IconButton size="small" aria-label="small">
        <Icon name="lucide:bell" />
      </IconButton>
      <IconButton size="medium" aria-label="medium">
        <Icon name="lucide:bell" />
      </IconButton>
      <IconButton size="large" aria-label="large">
        <Icon name="lucide:bell" />
      </IconButton>
    </div>
  ),
};

export const WithEdge: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <IconButton edge="start" aria-label="start">
        <Icon name="lucide:chevron-left" />
      </IconButton>
      <IconButton edge="end" aria-label="end">
        <Icon name="lucide:chevron-right" />
      </IconButton>
    </div>
  ),
};

export const WithSx: Story = {
  render: () => (
    <IconButton sx={{ border: '1px solid', borderColor: 'divider' }} aria-label="styled">
      <Icon name="mui:Close" />
    </IconButton>
  ),
};