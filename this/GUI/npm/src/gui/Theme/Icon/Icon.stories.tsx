

import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';

import Icon from './Icon';

const meta: Meta<typeof Icon> = {
  title: 'GUI/Icons/Icon',
  component: Icon,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `A lightweight Icon wrapper around **Material Symbols**.

**Notes**
- This component renders a \`<span>\` using the \`material-symbols-rounded\` class.
- Ensure the Material Symbols font is available (your Icon component imports \`material-symbols\`).
- Use \`name\` to pass the glyph name (e.g. \`home\`, \`palette\`, \`settings\`).

---

### Example
~~~tsx
<Icon name="home" weight={500} fill={0} iconColor="var(--gui-primary)" />
~~~
`,
      },
    },
  },
  argTypes: {
    name: {
      control: 'text',
      description: 'Material Symbols glyph name (e.g. `home`, `palette`, `settings`).',
    },
    iconColor: {
      control: 'color',
      description: 'CSS color value applied to the icon.',
    },
    fontSize: {
      control: 'text',
      description: 'Font size (number treated as px; or any CSS size string).',
    },
    weight: {
      control: { type: 'number', min: 100, max: 700, step: 100 },
      description: 'Font variation setting: wght.',
    },
    fill: {
      control: { type: 'number', min: 0, max: 1, step: 1 },
      description: 'Font variation setting: FILL (0 outlined, 1 filled).',
    },
    grade: {
      control: { type: 'number', min: -25, max: 200, step: 25 },
      description: 'Font variation setting: GRAD.',
    },
    opticalSize: {
      control: { type: 'number', min: 20, max: 48, step: 2 },
      description: 'Font variation setting: opsz.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Icon>;

export const Playground: Story = {
  args: {
    name: 'palette',
    iconColor: 'var(--gui-primary)',
    fontSize: 28,
    weight: 500,
    fill: 0,
    grade: 0,
    opticalSize: 24,
  },
  render: (args) => (
    <div
      style={{
        padding: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <Icon {...args} />
      <div style={{ opacity: 0.8, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
        <div>name: {String(args.name)}</div>
        <div>
          fill: {String(args.fill)} · wght: {String(args.weight)} · GRAD: {String(args.grade)} · opsz:{' '}
          {String(args.opticalSize)}
        </div>
      </div>
    </div>
  ),
};

export const CommonIcons: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A quick grid of common glyph names to confirm the font is loading and rendering correctly.',
      },
    },
  },
  render: () => {
    const items = [
      'home',
      'palette',
      'settings',
      'menu',
      'search',
      'favorite',
      'account_circle',
      'dashboard',
      'folder',
      'insights',
      'logout',
      'help',
      'code',
      'menu_book',
    ];

    return (
      <div style={{ padding: 24 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 14,
          }}
        >
          {items.map((name) => (
            <div
              key={name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: 12,
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.10)',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              <Icon name={name} fontSize={26} iconColor="var(--gui-primary)" />
              <span style={{ fontSize: 12, opacity: 0.85 }}>{name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const FilledVsOutlined: Story = {
  args: {
    name: "",
    iconColor: "#2d58a3"
  },

  parameters: {
    docs: {
      description: {
        story: 'Compare **fill=0** (outlined) vs **fill=1** (filled) using the same glyph.',
      },
    },
  },

  render: () => (
    <div style={{ padding: 24, display: 'flex', gap: 28, alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Icon name="palette" fill={0} weight={500} fontSize={34} iconColor="var(--gui-primary)" />
        <span style={{ fontSize: 12, opacity: 0.85 }}>fill=0</span>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Icon name="palette" fill={1} weight={500} fontSize={34} iconColor="var(--gui-primary)" />
        <span style={{ fontSize: 12, opacity: 0.85 }}>fill=1</span>
      </div>
    </div>
  )
};

export const WeightRamp: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Preview different **wght** values for the same glyph.',
      },
    },
  },
  render: () => {
    const weights = [100, 200, 300, 400, 500, 600, 700];
    return (
      <div style={{ padding: 24, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
        {weights.map((w) => (
          <div key={w} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="settings" weight={w} fill={0} fontSize={30} iconColor="var(--gui-secondary)" />
            <span style={{ fontSize: 12, opacity: 0.85 }}>wght={w}</span>
          </div>
        ))}
      </div>
    );
  },
};