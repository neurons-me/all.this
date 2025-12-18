import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import Noise from './Noise';
import { Box, Button, Typography } from '@/gui/components/atoms';
// A tiny in-memory ME mock so stories can run without app kernel wiring.
// It supports the two calling forms we need:
//   me(pathString) -> get
//   me.some.path[op](value) -> set (via Proxy)
function createMeMock() {
  const store = new Map<string, any>();

  const normalize = (p: string) =>
    String(p ?? '')
      .trim()
      .replace(/^\./, '')
      .replace(/\.+/g, '.')
      .replace(/\.$/, '');

  const rootFn: any = (path?: any) => {
    if (typeof path === 'string') return store.get(normalize(path));
    return undefined;
  };

  const makeProxy = (basePath: string) =>
    new Proxy(() => undefined, {
      get(_t, prop: string | symbol) {
        if (typeof prop === 'symbol') return undefined;
        // allow console debugging convenience
        if (prop === '__store') return store;

        const key = String(prop);
        // operator call: basePath["@"], basePath["="], etc
        if (key.startsWith('[') && key.endsWith(']')) {
          const op = key.slice(1, -1);
          return (value: any) => {
            store.set(basePath, { op, value });
            return me;
          };
        }

        const next = basePath ? `${basePath}.${key}` : key;
        return makeProxy(next);
      },
      apply(_t, _thisArg, args: any[]) {
        // Treat calling a proxy as a write at that path with implicit '='
        const value = args.length <= 1 ? args[0] : args;
        store.set(basePath, { op: '=', value });
        return me;
      },
    });

  const me: any = new Proxy(rootFn, {
    get(_t, prop: string | symbol) {
      if (typeof prop === 'symbol') return undefined;
      return makeProxy(String(prop));
    },
    apply(_t, _thisArg, args: any[]) {
      // me("a.b") -> read
      if (args.length === 1 && typeof args[0] === 'string') {
        return store.get(normalize(args[0]));
      }
      return me;
    },
  });

  return me;
}

const meta: Meta<typeof Noise> = {
  title: 'Components/Noise',
  component: Noise,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ padding: 16, minHeight: 320, maxWidth: 920 }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
A **Noise** input is a small declarative bridge between UI and a semantic ME tree.

- It can write values through an operator (e.g. \`@\`, \`=\`, \`_\`, \`~\`).
- It supports compact layout (e.g. 25% width) and a **check** commit button.
- Optional info icon opens your **Modal** molecule (if enabled in the component).

Stories use a tiny in-memory ME mock so they can render standalone.
        `.trim(),
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Noise>;

export const UsernameIdentity: Story = {
  name: 'Identity (@) with check',
  render: () => {
    const me = React.useMemo(() => createMeMock(), []);
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Noise
          me={me}
          path="profile"
          operator="@"
          placeholder="username"
          width="25%"
          showCheck
        />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Tip: type a username and click the check icon to commit the identity ref.
        </Typography>
      </Box>
    );
  },
};

export const InlineValueReadout: Story = {
  name: 'Readout (shows last committed)',
  render: () => {
    const me = React.useMemo(() => createMeMock(), []);
    const [tick, setTick] = React.useState(0);

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Noise
          me={me}
          path="profile.name"
          operator="="
          label="Name"
          placeholder="profile.name"
          width={{ xs: '100%', sm: '50%', md: '25%' } as any}
          showCheck
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Last committed at <code>profile.name</code>:
          </Typography>
          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
            {JSON.stringify((me as any)('profile.name') ?? null)}
          </Typography>
          <Button size="small" variant="outlined" onClick={() => setTick((t) => t + 1)}>
            refresh
          </Button>
        </Box>
      </Box>
    );
  },
};

export const CompactRow: Story = {
  name: 'Compact row (25% width)',
  render: () => {
    const me = React.useMemo(() => createMeMock(), []);
    return (
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Noise
          me={me}
          path="blockchain.url"
          operator="="
          label="Blockchain URL"
          placeholder="http://localhost:8161"
          width="25%"
          showCheck
        />
        <Noise
          me={me}
          path="blockchain.port"
          operator="="
          label="Port"
          placeholder="8161"
          width={140 as any}
          showCheck
        />
      </Box>
    );
  },
};

export const ResponsiveWidth: Story = {
  name: 'Responsive width',
  render: () => {
    const me = React.useMemo(() => createMeMock(), []);
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Noise
          me={me}
          path="blockchain.url"
          operator="="
          label="Blockchain"
          placeholder="blockchain"
          width={{ xs: '100%', sm: '60%', md: '40%', lg: '25%' } as any}
          showCheck
        />
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Resize the preview to see width adapt across breakpoints.
        </Typography>
      </Box>
    );
  },
};
