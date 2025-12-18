/*
 * This.GUI — Noise
 *
 * A declarative "ME-aware" input that can write values into the ME tree using an operator.
 *
 * Primary goals
 * - Be UI-engine agnostic by importing from This.GUI atoms/molecules (not @mui/material).
 * - Support different input "kinds" (text, switch, slider). Expand later.
 * - Provide a consistent way to:
 *    - display an input
 *    - show state (dirty / committed / error)
 *    - optionally commit via a check button
 *
 * Notes
 * - We keep this component deliberately small and composable.
 * - It does NOT assume a global ME; you pass `me` in.
 * - Operator is applied by selecting an operator function from `me`.
 *   Example: operator="@" => me["@"](value)
 */

import * as React from 'react';
import { Box, Button, IconButton, Switch, Typography } from '@/gui/components/atoms';
import Modal from '@/gui/components/molecules/Modal/Modal';
import Icon from '@/gui/Theme/Icon/Icon';

type NoiseKind = 'text' | 'switch' | 'slider';

type CommitOn = 'change' | 'blur' | 'check' | 'enter';

export type NoiseProps = {
  /** ME runtime (proxy) */
  me: any;

  /** Semantic path inside ME, e.g. "profile.name" or "wallet.netget.keys" */
  path: string;

  /** Operator to call at the target path. Common: "=" for assign, "@" identity, "~" noise, "_" secret */
  operator?: string;

  /** Label shown above/alongside the input */
  label?: string;

  /** Placeholder (text kind) */
  placeholder?: string;

  /** Input kind */
  kind?: NoiseKind;

  /** Initial value to seed draft (if ME read is undefined) */
  defaultValue?: any;

  /** Commit policy */
  commitOn?: CommitOn;

  /** Whether to show the explicit check commit button */
  showCheck?: boolean;

  /** If true, reads from ME on mount and whenever `path` changes */
  syncFromMe?: boolean;

  /** Optional: width control (e.g. '25%') */
  width?: number | string;

  /** Optional: sx overrides */
  sx?: any;

  /** Helpers */
  disabled?: boolean;
  readOnly?: boolean;

  /** Optional: help modal content */
  infoTitle?: string;
  info?: React.ReactNode;
};

function safeGetPath(me: any, path: string): any {
  if (!me) return undefined;
  const p = String(path || '').trim();
  if (!p) return undefined;

  // Prefer root-get style if available: me("a.b.c")
  try {
    if (typeof me === 'function') return me(p);
  } catch {
    // ignore
  }

  // Fallback: traverse properties.
  try {
    return p.split('.').filter(Boolean).reduce((acc: any, k: string) => (acc ? acc[k] : undefined), me);
  } catch {
    return undefined;
  }
}

function getTargetProxy(me: any, path: string): any {
  const p = String(path || '').trim();
  if (!p) return me;
  return p.split('.').filter(Boolean).reduce((acc: any, k: string) => (acc ? acc[k] : undefined), me);
}

export default function Noise({
  me,
  path,
  operator = '=',
  label = 'Noise',
  placeholder,
  kind = 'text',
  defaultValue,
  commitOn = 'check',
  showCheck = true,
  syncFromMe = true,
  width = '100%',
  sx,
  disabled,
  readOnly,
  infoTitle = 'About this field',
  info,
}: NoiseProps) {
  const [draft, setDraft] = React.useState<any>(defaultValue ?? '');
  const [committed, setCommitted] = React.useState<any>(undefined);
  const [dirty, setDirty] = React.useState(false);
  const [status, setStatus] = React.useState<'idle' | 'ok' | 'error'>('idle');
  const [error, setError] = React.useState<string | null>(null);
  const [infoOpen, setInfoOpen] = React.useState(false);

  // Seed from ME
  React.useEffect(() => {
    if (!syncFromMe) return;
    const v = safeGetPath(me, path);
    if (v !== undefined) {
      setDraft(v);
      setCommitted(v);
      setDirty(false);
      setStatus('idle');
      setError(null);
    } else if (defaultValue !== undefined) {
      setDraft(defaultValue);
      setCommitted(undefined);
      setDirty(false);
      setStatus('idle');
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, path]);

  const commit = React.useCallback(
    (nextValue?: any) => {
      const valueToCommit = nextValue !== undefined ? nextValue : draft;
      try {
        const target = getTargetProxy(me, path);
        if (!target) throw new Error(`Invalid ME path: ${path}`);

        const opFn = target?.[operator];
        if (typeof opFn !== 'function') {
          throw new Error(`Operator '${operator}' not found at path '${path}'.`);
        }

        // Execute operator call
        opFn(valueToCommit);

        setCommitted(valueToCommit);
        setDirty(false);
        setStatus('ok');
        setError(null);

        // Return focus status back to idle after a moment (non-blocking UI)
        window.setTimeout(() => setStatus('idle'), 900);
      } catch (e: any) {
        setStatus('error');
        setError(e?.message ?? 'Commit failed');
      }
    },
    [draft, me, operator, path]
  );

  const onChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setDraft(v);
    setDirty(true);
    setStatus('idle');
    setError(null);
    if (commitOn === 'change') commit(v);
  };

  const onBlur = () => {
    if (commitOn === 'blur' && dirty) commit();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (commitOn === 'enter' && e.key === 'Enter') {
      e.preventDefault();
      commit();
    }
  };

  const onToggle = (_: any, checked?: boolean) => {
    // Switch from MUI passes (event, checked)
    const v = typeof checked === 'boolean' ? checked : !!(_?.target?.checked);
    setDraft(v);
    setDirty(true);
    setStatus('idle');
    setError(null);
    if (commitOn === 'change') commit(v);
  };

  const borderColor =
    status === 'error' ? 'error.main' : status === 'ok' ? 'success.main' : 'divider';

  const bgColor = status === 'ok' ? 'success.muted' : 'background.paper';

  return (
    <Box
      sx={{
        width,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>

        {info ? (
          <IconButton
            size="small"
            aria-label="Info"
            onClick={() => setInfoOpen(true)}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 999,
              bgcolor: 'background.paper',
            }}
          >
            <Icon name="info" />
          </IconButton>
        ) : null}
      </Box>

      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          border: '1px solid',
          borderColor,
          borderRadius: 2,
          px: 1.25,
          py: 0.75,
          bgcolor: bgColor,
          transition: 'border-color 160ms ease, background-color 160ms ease',
          minHeight: 44,
        }}
      >
        {/* Border placeholder (path) */}
        {path ? (
          <Box
            component="span"
            sx={{
              position: 'absolute',
              top: 0,
              left: 52, // after operator badge area
              transform: 'translateY(-50%)',
              px: 0.75,
              py: 0.15,
              borderRadius: 999,
              bgcolor: bgColor,
              color: 'text.disabled',
              fontSize: 11,
              lineHeight: 1.1,
              fontFamily: 'monospace',
              letterSpacing: 0.2,
              userSelect: 'none',
              pointerEvents: 'none',
              maxWidth: 'calc(100% - 120px)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={path}
          >
            {path}
          </Box>
        ) : null}

        {/* Left operator badge */}
        <Box
          sx={{
            px: 1,
            py: 0.25,
            borderRadius: 999,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.default',
            color: 'text.secondary',
            fontFamily: 'monospace',
            fontSize: 12,
            lineHeight: 1.2,
            userSelect: 'none',
          }}
          title={`operator: ${operator}`}
        >
          {operator}
        </Box>

        {/* The input */}
        {kind === 'switch' ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <Switch
              checked={!!draft}
              onChange={onToggle as any}
              disabled={disabled}
              inputProps={{ 'aria-label': label }}
            />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {String(!!draft)}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            {/* We intentionally use a plain input for now to avoid requiring TextField atom here.
                If you already have TextField in atoms, swap this input for <TextField ... />.
             */}
            <Box
              component="input"
              value={draft ?? ''}
              placeholder={placeholder}
              disabled={disabled}
              readOnly={readOnly}
              onChange={onChangeText}
              onBlur={onBlur}
              onKeyDown={onKeyDown}
              sx={{
                width: '100%',
                border: 0,
                outline: 'none',
                bgcolor: 'transparent',
                color: 'text.primary',
                fontSize: 14,
                lineHeight: 1.4,
              }}
            />
          </Box>
        )}

        {/* Commit controls */}
        {showCheck ? (
          <Button
            variant="outlined"
            size="small"
            disabled={disabled || readOnly || (!dirty && committed !== undefined)}
            onClick={() => commit()}
            sx={{
              minWidth: 36,
              px: 1,
              py: 0.5,
              borderRadius: 2,
              textTransform: 'none',
            }}
            aria-label="Commit"
          >
            <Icon name="check" />
          </Button>
        ) : null}
      </Box>

      {/* Status / error line */}
      {error ? (
        <Typography variant="caption" sx={{ color: 'error.main' }}>
          {error}
        </Typography>
      ) : null}

      {info ? (
        <Modal open={infoOpen} onClose={() => setInfoOpen(false)} title={infoTitle} width={520}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {typeof info === 'string' ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {info}
              </Typography>
            ) : (
              info
            )}
          </Box>
        </Modal>
      ) : null}
    </Box>
  );
}