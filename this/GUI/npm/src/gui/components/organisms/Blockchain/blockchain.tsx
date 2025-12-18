// this.GUI — Blockchain Container (Clean Version)
// This component ONLY manages:
//  ✔ Endpoint URL
//  ✔ Connection state
//  ✔ Tabs (Users / Blocks)
//  ✔ Passing endpoint prop downward
// No fetching, no table markup.
//@/gui/components/organisms/IdentityNoise/Triad/Blockchain/blockchain.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, IconButton, Tooltip, Typography } from '@/gui/components/atoms';
import Icon from '@/gui/Theme/Icon/Icon';
import { useGuiTheme, useGuiMediaQuery } from '@/gui/hooks';
import UsersTable from './Usernames/Usernames';
import { BlocksTable } from './Blocks/BlocksTable';
export default function Blockchain() {
  const [endpoint, setEndpoint] = useState('http://localhost:8161');
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'blocks' | 'details'>('users');
  const [showEndpointInput, setShowEndpointInput] = useState(false);
  const theme = useGuiTheme();
  const isMobile = useGuiMediaQuery(theme.breakpoints.down('sm'));
  const debounceRef = useRef<number | null>(null);
  function normalizeEndpoint(raw: string) {
    const v = (raw ?? '').trim();
    if (!v) return null;
    // If user types a token like "Blockchain", don't treat as an endpoint.
    if (!v.includes('.') && !v.includes(':') && !v.startsWith('/')) return null;

    // Add protocol if missing.
    const withProto = /^https?:\/\//i.test(v) ? v : `http://${v}`;
    // Strip trailing slash for consistent concatenation.
    return withProto.replace(/\/+$/, '');
  }
  const safeEndpoint = normalizeEndpoint(endpoint) ?? '';

  async function handleConnect() {
    const base = safeEndpoint;
    if (!base) {
      setConnected(false);
      return;
    }
    try {
      const res = await fetch(`${base}/`, { method: 'GET' });
      if (!res.ok) throw new Error('Failed');
      setConnected(true);
    } catch {
      setConnected(false);
    }
  }

  function scheduleConnect(nextEndpoint: string) {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    const nextBase = normalizeEndpoint(nextEndpoint) ?? '';
    if (!nextBase) {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      setConnected(false);
      return;
    }

    debounceRef.current = window.setTimeout(() => {
      // noop: the [safeEndpoint] effect will connect using the latest endpoint value
    }, 450);
  }

  function onEndpointKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      handleConnect();
    }
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    // Auto-connect when we have a valid endpoint (on mount and whenever it changes)
    if (!safeEndpoint) return;
    handleConnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeEndpoint]);

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        padding: '1.5rem',
        maxWidth: '900px',
        margin: '0 auto',
        background: 'background.paper',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        <Tooltip
          title={showEndpointInput ? 'Hide blockchain URL' : 'Show blockchain URL'}
          placement="bottom"
          arrow
        >
          <Box component="span" sx={{ display: 'inline-flex' }}>
            <IconButton
              aria-label={showEndpointInput ? 'Hide blockchain input' : 'Show blockchain input'}
              onClick={() => setShowEndpointInput((v) => !v)}
              size="small"
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                color:
                  !safeEndpoint
                    ? 'divider'
                    : connected
                      ? 'success.main'
                      : 'error.main',
                '&:hover': {
                  bgcolor: 'background.nav',
                  color:
                    !safeEndpoint
                      ? 'text.secondary'
                      : connected
                        ? 'success.main'
                        : 'error.main',
                },
              }}
            >
              <Icon name="dns" fontSize={18} />
            </IconButton>
          </Box>
        </Tooltip>

        <Tooltip title="What is a blockchain URL?" placement="bottom" arrow>
          <Box component="span" sx={{ display: 'inline-flex' }}>
            <IconButton
              aria-label="Blockchain URL info"
              size="small"
              onClick={() => setActiveTab('details')}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                color: 'text.secondary',
                '&:hover': { bgcolor: 'background.nav', color: 'text.primary' },
              }}
            >
              <Icon name="info" />
            </IconButton>
          </Box>
        </Tooltip>
      </Box>
      {/* Connection Input */}
      {showEndpointInput && (
        <Box
          sx={{
            marginTop: '1rem',
            display: 'flex',
            gap: 0.75,
            alignItems: 'center',
            flexDirection: isMobile ? 'column' : 'row',
          }}
        >
          <Box
            sx={{
              flex: '0 0 auto',
              width: isMobile ? '100%' : '25%',
              minWidth: 240,
            }}
          >
            <Box
              component="fieldset"
              sx={{
                m: 0,
                p: 0,
                border: '1px solid',
                borderColor: connected ? 'success.main' : 'divider',
                borderRadius: 2,
                minHeight: 36,
                bgcolor: 'background.default',
                transition: 'border-color 120ms ease, box-shadow 120ms ease',
                '&:focus-within': {
                  borderColor: connected ? 'success.main' : 'primary.main',
                  boxShadow: (theme: any) =>
                    connected
                      ? `0 0 0 3px ${theme?.palette?.success?.main}22`
                      : `0 0 0 3px ${theme?.palette?.primary?.main}22`,
                },
              }}
            >
              <Box
                component="legend"
                sx={{
                  px: 0.75,
                  mx: 1,
                  fontSize: '0.75rem',
                  color: connected ? 'success.main' : 'text.secondary',
                  lineHeight: 1,
                  cursor: 'help',
                }}
                onClick={() => setActiveTab('details')}
                title="What is a blockchain URL?"
              >
                Blockchain
              </Box>

              <Box
                component="input"
                type="text"
                name="blockchain"
                aria-label="Blockchain endpoint"
                placeholder="http://localhost:8161"
                title="Example: http://localhost:8161"
                value={endpoint}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const next = e.target.value;
                  setEndpoint(next);
                  scheduleConnect(next);
                }}
                onKeyDown={onEndpointKeyDown}
                sx={{
                  width: '100%',
                  px: 1.25,
                  py: 0.75,
                  border: 0,
                  outline: 'none',
                  bgcolor: 'transparent',
                  color: 'text.primary',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box',
                }}
              />
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            <IconButton
              aria-label={connected ? 'Connected' : 'Connect'}
              onClick={() => handleConnect()}
              size="small"
              disabled={!safeEndpoint}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                color: connected ? 'success.main' : 'text.secondary',
                '&:hover': {
                  bgcolor: 'background.nav',
                  color: connected ? 'success.main' : 'text.primary',
                },
              }}
            >
              <Icon name={connected ? 'check' : 'sync'} />
            </IconButton>
          </Box>
        </Box>
      )}
      {/* Tabs */}
      <Box
        sx={{
          display: 'flex',
          gap: '1rem',
          marginTop: '1.5rem',
          marginBottom: '1rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: '0.5rem',
        }}
      >
        <Button
          variant={activeTab === 'users' ? 'outlined' : 'text'}
          size="small"
          sx={{ minHeight: 32, px: 1.25, fontSize: '0.8rem' }}
          onClick={() => setActiveTab('users')}
        >
          Users
        </Button>
        <Button
          variant={activeTab === 'blocks' ? 'outlined' : 'text'}
          size="small"
          sx={{ minHeight: 32, px: 1.25, fontSize: '0.8rem' }}
          onClick={() => setActiveTab('blocks')}
        >
          Blocks
        </Button>
        <Button
          variant={activeTab === 'details' ? 'outlined' : 'text'}
          size="small"
          sx={{ minHeight: 32, px: 1.25, fontSize: '0.8rem' }}
          onClick={() => setActiveTab('details')}
        >
          Details
        </Button>
      </Box>
      {/* Render Only Child Components */}
      {activeTab === 'users' && safeEndpoint && <UsersTable endpoint={safeEndpoint} />}
      {activeTab === 'blocks' && safeEndpoint && <BlocksTable endpoint={safeEndpoint} />}

      {activeTab === 'details' && (
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 2,
            bgcolor: 'background.default',
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            Blockchain URL
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
            This view connects to a blockchain node running at a specific <strong>host</strong> and <strong>port</strong>.
          </Typography>

          <Typography variant="body2" sx={{ mb: 1.25 }}>
            <strong>What is a blockchain URL?</strong>
            <br />
            It’s the address of a server (node) that exposes blockchain data over HTTP. Example:
            <br />
            <Typography component="span" sx={{ fontFamily: 'monospace' }}>
              http://localhost:8161
            </Typography>
          </Typography>

          <Typography variant="body2" sx={{ mb: 1.25 }}>
            <strong>What does this screen do?</strong>
            <br />
            When you enter a URL, this page tries to reach that node and then displays:
          </Typography>

          <Box component="ul" sx={{ m: 0, pl: 2.5, color: 'text.secondary' }}>
            <li>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                <strong>Users</strong> — identities or usernames registered on that chain (if supported).
              </Typography>
            </li>
            <li>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                <strong>Blocks</strong> — the latest blocks and their data from that chain (if supported).
              </Typography>
            </li>
          </Box>

          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5 }}>
            Tip: <strong>localhost</strong> means the blockchain node is running on your own machine. A remote host means it’s running somewhere else.
          </Typography>
        </Box>
      )}
    </Box>
  );
}