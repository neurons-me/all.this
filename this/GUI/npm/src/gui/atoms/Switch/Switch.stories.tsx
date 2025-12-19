// src/gui/atoms/Switch/Switch.stories.tsx
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Stack, Typography, Switch } from '@/gui/atoms';
import { FormControlLabel } from '@mui/material';

// ======================= Meta =======================
const meta: Meta<typeof Switch> = {
  title: 'Atoms/Forms & Inputs/Switch',
  component: Switch,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
        <Box sx={{ p: 2 }}>
          <Story />
        </Box>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
**Switch (This.GUI atom)** is a thin wrapper around MUI's \`Switch\`.
It keeps MUI behavior, styling, and typing, but you import it from \`@/gui/atoms\` to keep your app decoupled from MUI.

---

# Usage

## React (imperative)
~~~tsx
import { Switch } from '@/gui/atoms';

export function Example() {
  const [enabled, setEnabled] = React.useState(false);
  return (
    <Switch
      checked={enabled}
      onChange={(_, v) => setEnabled(v)}
      color="primary"
      size="medium"
    />
  );
}
~~~

With an accessible label (MUI way):
~~~tsx
import { FormControlLabel } from '@mui/material';

<FormControlLabel control={<Switch defaultChecked />} label="Enable notifications" />
~~~

---

## Declarative (resolver)
If you’re rendering via a JSON/registry resolver, you can pass the same props:

~~~json
{
  "type": "Switch",
  "props": {
    "label": "Enable feature",
    "defaultChecked": true,
    "color": "primary",
    "size": "small",
    "id": "feat-toggle",
    "sx": { "ml": 1 }
  }
}
~~~

The resolver supports:
- All native MUI Switch props (\`checked\`, \`defaultChecked\`, \`onChange\`, \`color\`, \`size\`, \`disabled\`, \`edge\`, \`inputProps\`, \`sx\`, etc.).
- \`label?: ReactNode\` and \`labelPlacement?: 'start' | 'end' | 'top' | 'bottom'\` (wraps in \`FormControlLabel\` when present).
- \`id\`, \`className\`, \`data-testid\` passthrough for testing and DOM hooks.

---
        `,
      },
    },
  },
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Controlled state. Use with onChange.',
      table: { category: 'Behavior' },
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Uncontrolled initial state.',
      table: { category: 'Behavior' },
    },
    disabled: {
      control: 'boolean',
      table: { category: 'Behavior' },
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'default'],
      table: { category: 'Appearance' },
    },
    size: {
      control: 'radio',
      options: ['small', 'medium'],
      description: 'Same as MUI Switch (no large by default).',
      table: { category: 'Appearance' },
    },
    edge: {
      control: 'radio',
      options: [false, 'start', 'end'],
      table: { category: 'Appearance' },
    },
    sx: { table: { category: 'Style' } },
    id: { table: { category: 'DOM' } },
    className: { table: { category: 'DOM' } },
    // Not useful to control live in SB
    onChange: { table: { disable: true } },
    inputProps: { table: { disable: true } },
  },
  args: {
    defaultChecked: false,
    color: 'primary',
    size: 'medium',
    edge: false,
  },
};
export default meta;

type Story = StoryObj<typeof Switch>;

// ======================= Stories =======================

export const Playground: Story = {
  render: (args) => <Switch {...args} />,
};

export const LabeledVariants: Story = {
  name: 'With label & placement',
  render: () => (
    <Stack spacing={2}>
      <FormControlLabel control={<Switch defaultChecked />} label="End (default)" />
      <FormControlLabel control={<Switch defaultChecked />} label="Start" labelPlacement="start" />
      <FormControlLabel control={<Switch />} label="Top" labelPlacement="top" />
      <FormControlLabel control={<Switch />} label="Bottom" labelPlacement="bottom" />
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'When `label` is present, the atom wraps the control with `FormControlLabel`. Use `labelPlacement` to position it.',
      },
    },
  },
};

export const SizesAndColors: Story = {
  name: 'Sizes & colors',
  render: () => (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="body2" sx={{ minWidth: 88 }}>small</Typography>
        <Switch size="small" color="default" defaultChecked />
        <Switch size="small" color="primary" defaultChecked />
        <Switch size="small" color="secondary" defaultChecked />
      </Stack>
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="body2" sx={{ minWidth: 88 }}>medium</Typography>
        <Switch size="medium" color="default" defaultChecked />
        <Switch size="medium" color="primary" defaultChecked />
        <Switch size="medium" color="secondary" defaultChecked />
      </Stack>
    </Stack>
  ),
};

export const ControlledExample: Story = {
  name: 'Controlled (React state)',
  render: () => {
    const [on, setOn] = React.useState(false);
    return (
      <Stack spacing={1.5}>
        <Typography variant="body2">Value: <b>{on ? 'true' : 'false'}</b></Typography>
        <FormControlLabel
          control={
            <Switch
              checked={on}
              onChange={(_, v) => setOn(v)}
              color={on ? 'primary' : 'secondary'}
            />
          }
          label="Controlled switch"
        />
      </Stack>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Classic controlled pattern: bind `checked` and update via `onChange`. You can also change appearance based on state.',
      },
    },
  },
};

export const EdgeAndSx: Story = {
  name: 'Edge & custom sx',
  render: () => (
    <Stack spacing={2}>
      <FormControlLabel control={<Switch edge="start" defaultChecked />} label="Edge start" />
      <FormControlLabel
        control={
          <Switch
            defaultChecked
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                opacity: 0.7,
              },
            }}
          />
        }
        label="Custom sx"
      />
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Pass any `sx` overrides exactly as you would with MUI. Useful for fine-grained tuning without creating a new variant.',
      },
    },
  },
};