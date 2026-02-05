import React, { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import Theme from '@/gui/Theme/Theme';
import Box from '@/gui/atoms/Box/Box';
import Paper from '@/gui/atoms/Paper/Paper';
import Typography from '@/gui/atoms/Typography/Typography';
import CodeBlock from '@/gui/molecules/CodeBlock/CodeBlock';

type Parsed = {
  input: string;
  origin: string;
  pathname: string;
  search: string;
  hash: string;
  params: Record<string, string>;
};

type Semantics =
  | { kind: 'user'; handle: string }
  | { kind: 'tag'; tag: string }
  | { kind: 'pkg'; pkg: string }
  | { kind: 'queryPath'; expr: string }
  | { kind: 'exprQuery'; route: 'search' | 'filter'; expr: string }
  | { kind: 'page' };

function parseUrl(input: string): Parsed {
  // Base ensures relative paths parse consistently.
  const u = new URL(input, 'https://example.local');
  const params: Record<string, string> = {};
  u.searchParams.forEach((v, k) => {
    params[k] = v;
  });
  return {
    input,
    origin: u.origin,
    pathname: u.pathname,
    search: u.search,
    hash: u.hash,
    params,
  };
}

function classify(p: Parsed): Semantics {
  const { pathname, params } = p;

  if (pathname.startsWith('/@')) {
    const handle = pathname.slice(2).split('/')[0] || '';
    return { kind: 'user', handle };
  }

  if (pathname.startsWith('/tag/')) {
    const tag = pathname.slice('/tag/'.length).split('/')[0] || '';
    return { kind: 'tag', tag };
  }

  if (pathname.startsWith('/pkg/')) {
    const pkg = pathname.slice('/pkg/'.length).split('/')[0] || '';
    return { kind: 'pkg', pkg };
  }

  if (pathname.startsWith('/query/')) {
    // Everything after /query/ is the expression. Allow encoded chars.
    const raw = pathname.slice('/query/'.length);
    const expr = decodeURIComponent(raw);
    return { kind: 'queryPath', expr };
  }

  if ((pathname === '/search' || pathname === '/filter') && typeof params.expr === 'string') {
    return {
      kind: 'exprQuery',
      route: pathname === '/search' ? 'search' : 'filter',
      expr: params.expr,
    };
  }

  return { kind: 'page' };
}

function buildEncoded(route: '/search' | '/filter', expr: string): string {
  const sp = new URLSearchParams();
  sp.set('expr', expr);
  return `${route}?${sp.toString()}`;
}

function buildRaw(route: '/search' | '/filter', expr: string): string {
  // WARNING: This is intentionally "wrong" when expr contains `&`.
  return `${route}?expr=${expr}`;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
      <Typography sx={{ opacity: 0.75, minWidth: 120 }}>{label}</Typography>
      <Typography sx={{ fontFamily: 'monospace' }}>{value || '—'}</Typography>
    </Box>
  );
}

function SemanticsDemo({ examples, title, subtitle }: { examples: string[]; title: string; subtitle: string }) {
  const [current, setCurrent] = useState(examples[0] ?? '/');

  const parsed = useMemo(() => parseUrl(current), [current]);
  const semantics = useMemo(() => classify(parsed), [parsed]);

  return (
    <Theme initialThemeId="neurons.me" initialMode="dark">
      <Box sx={{ p: 3, display: 'grid', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: 20, fontWeight: 800 }}>{title}</Typography>
          <Typography sx={{ opacity: 0.8, mt: 0.5 }}>{subtitle}</Typography>
        </Box>

        <Paper sx={{ p: 2 }}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Examples</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {examples.map((u) => (
              <button
                key={u}
                onClick={() => setCurrent(u)}
                style={{
                  padding: '8px 10px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.14)',
                  background: u === current ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.06)',
                  color: 'inherit',
                  cursor: 'pointer',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  fontSize: 12,
                  lineHeight: 1.2,
                }}
                title="Switch route"
              >
                {u}
              </button>
            ))}
          </Box>
        </Paper>

        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          <Paper sx={{ p: 2 }}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>Parsed</Typography>
            <Row label="input" value={parsed.input} />
            <Row label="origin" value={parsed.origin} />
            <Row label="pathname" value={parsed.pathname} />
            <Row label="search" value={parsed.search} />
            <Row label="hash" value={parsed.hash} />

            <Typography sx={{ fontWeight: 700, mt: 2, mb: 1 }}>params</Typography>
            <CodeBlock language="json" code={JSON.stringify(parsed.params, null, 2)} />

            <Typography sx={{ fontWeight: 700, mt: 2, mb: 1 }}>classified</Typography>
            <CodeBlock language="json" code={JSON.stringify(semantics, null, 2)} />
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>Notes</Typography>
            <Typography sx={{ opacity: 0.85 }}>
              In query strings, <code>&amp;</code> is the parameter separator.
              If your expression contains <code>&amp;&amp;</code> you must encode it (or build the URL via <code>URLSearchParams</code>),
              otherwise the browser will split the expression into multiple params.
            </Typography>
            <Typography sx={{ opacity: 0.85, mt: 1 }}>
              Path prefixes like <code>/@user</code> and <code>/tag/x</code> avoid collisions with reserved URL symbols like <code>#</code>, <code>?</code>, and <code>&amp;</code>.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Theme>
  );
}

const meta: Meta = {
  title: 'Router/Semantics',
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj;

export const QueryExpressions: Story = {
  render: () => {
    const expr1 = '(a&&b)';
    const expr2 = '(price>100)&&tag=ai&&cost=$$';

    const encodedSearch = buildEncoded('/search', expr1);
    const encodedFilter = buildEncoded('/filter', expr2);

    // Intentionally ambiguous/broken when used raw (because `&` is a separator in querystrings)
    const rawFilter = buildRaw('/filter', expr2);

    return (
      <SemanticsDemo
        title="Semantics in QUERY"
        subtitle="Use ?expr=… for operators like &&, $$, () — but ALWAYS encode expressions (URLSearchParams)."
        examples={[encodedSearch, encodedFilter, rawFilter]}
      />
    );
  },
};

export const PathPrefixes: Story = {
  render: () => {
    const expr = encodeURIComponent('(price>100)&&tag=ai');
    return (
      <SemanticsDemo
        title="Semantics in PATH"
        subtitle="Use explicit prefixes (/@user, /tag/x, /pkg/name, /query/…) to avoid collisions with reserved URL symbols."
        examples={['/@abella', '/tag/ai', '/pkg/this.gui', `/query/${expr}`]}
      />
    );
  },
};
