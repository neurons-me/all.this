// src/stories/Theme/Typography.stories.jsx
import { Box, Typography, Paper, Divider, Stack, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * Small helper to render a sample block for a variant
 */
const TypeRow = ({ variant, sample = 'The quick brown fox jumps over the lazy dog 1234', extra }) => {
  const theme = useTheme();
  const v = theme.typography?.[variant] || {};
  const lineHeight = typeof v.lineHeight === 'number' ? v.lineHeight : String(v.lineHeight || '');
  const fontSize = v.fontSize || '';
  const weight = v.fontWeight || '';

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.25,
        borderColor: theme.custom?.border || theme.palette.divider,
        bgcolor: 'background.paper',
        minWidth: 280,
        flex: '1 1 320px',
      }}
    >
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
        {variant}
      </Typography>
      <Typography variant={variant} sx={{ mt: 0.5 }}>
        {sample}
      </Typography>
      <Divider sx={{ my: 1 }} />
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        <strong>font-size:</strong> {fontSize}{'  '}
        <strong>line-height:</strong> {lineHeight}{'  '}
        <strong>font-weight:</strong> {weight || '—'}
        {extra ? <> · {extra}</> : null}
      </Typography>
    </Paper>
  );
};

const Section = ({ title, hint, children }) => (
  <Box sx={{ my: 3 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {hint ? <Chip size="small" label={hint} /> : null}
    </Box>
    <Divider sx={{ my: 1.5 }} />
    {children}
  </Box>
);

/**
 * Preview of the main typography scale coming from the active theme.
 * Uses whatever your token engine compiled into theme.typography.
 */
function TypographyScale() {
  const theme = useTheme();

  const variants = [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'subtitle1',
    'body1',
    'body2',
    'button',
  ];

  return (
    <Box sx={{ p: 2, bgcolor: 'background.default', color: 'text.primary' }}>
      <Section title="Font Family">
        <Typography variant="body2">
          <strong>theme.typography.fontFamily:</strong>{' '}
          <code>{theme.typography?.fontFamily}</code>
        </Typography>
      </Section>

      <Section title="Variants">
        <Stack direction="row" spacing={1.25} useFlexGap flexWrap="wrap">
          {variants.map((v) => (
            <TypeRow key={v} variant={v} />
          ))}
        </Stack>
      </Section>
    </Box>
  );
}

/**
 * Extra details from tokens exposed in the runtime:
 * - lineHeights scale (if defined in theme.typography.lineHeights)
 * - weights (if your tokens encode them)
 */
function TypographyDetails() {
  const theme = useTheme();
  const lh = theme.typography?.lineHeights || {};
  const weights = {
    bold: theme.typography?.fontWeightBold,
    medium: theme.typography?.fontWeightMedium,
    regular: theme.typography?.fontWeightRegular,
  };

  return (
    <Box sx={{ p: 2, bgcolor: 'background.default', color: 'text.primary' }}>
      <Section title="Line Heights Scale" hint="From tokens → theme.typography.lineHeights">
        {Object.keys(lh).length ? (
          <Stack direction="row" spacing={1.25} useFlexGap flexWrap="wrap">
            {Object.entries(lh).map(([k, v]) => (
              <Paper
                key={k}
                variant="outlined"
                sx={{
                  p: 1.25,
                  minWidth: 160,
                  borderColor: theme.custom?.border || theme.palette.divider,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {k}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {String(v)}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography sx={{ lineHeight: Number(v) || v }}>
                  The quick brown fox jumps over the lazy dog.
                </Typography>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No custom line height scale found in theme.typography.lineHeights.
          </Typography>
        )}
      </Section>

      <Section title="Font Weights (if provided)">
        <Stack direction="row" spacing={1.25} useFlexGap flexWrap="wrap">
          {Object.entries(weights).map(([k, v]) => (
            <Paper
              key={k}
              variant="outlined"
              sx={{
                p: 1.25,
                minWidth: 160,
                borderColor: theme.custom?.border || theme.palette.divider,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {k}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {v ?? '—'}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography sx={{ fontWeight: v ?? 600 }}>
                The quick brown fox jumps over the lazy dog.
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Section>
    </Box>
  );
}

export default {
  title: 'Theme/Typography',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Typography scale compiled from tokens. Shows font family, variant sizes/weights/line-height, and optional line-height scale & weights if your tokens expose them.',
      },
    },
  },
};

export const Scale = {
  name: 'Scale',
  render: () => <TypographyScale />,
  parameters: {
    docs: {
      description: {
        story:
          'Core typography variants from the active theme (h1–h5, subtitle1, body1, body2, button).',
      },
    },
  },
};

export const Details = {
  name: 'Details (Line Heights & Weights)',
  render: () => <TypographyDetails />,
  parameters: {
    docs: {
      description: {
        story:
          'Optional token-driven extras: line-height scale and font weights if present in the compiled theme.',
      },
    },
  },
};