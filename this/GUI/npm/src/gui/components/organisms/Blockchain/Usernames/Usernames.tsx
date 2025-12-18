// UsersTable.tsx — Cleaker / Blockchain Viewer
import React, { useEffect, useState } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, IconButton, Avatar } from "@/gui/components/atoms";
import Icon from "@/gui/Theme/Icon/Icon";
import QR from "./QR";

const ME_EMBED_BITMAP: string[] = [
  "000000000000000000000000000111111000",
  "000000000000000000000000000111111000",
  "111000111111111110000000111111111111",
  "111000111111111110000000111000000111",
  "111000111111111110000000111000000111",
  "000000111001111001110000111111111111",
  "000000111001111001110000111111111111",
  "000000111001111001110000111111111111",
  "000000111001111001110000111000000000",
  "000000111001111001110000111000000000",
  "000000000000000000000000000000000000",
  "000000111000000001110000111000000000",
  "000000111000000001110000111000000000",
  "000000111000000001110000111111111111",
  "000000111000000001110000000111111111",
  "000000111000000001110000000111111111",
];

export interface UsersTableProps {
  endpoint: string; // e.g. "http://localhost:8161"
}

interface UserEntry {
  username: string;
  identityHash: string;
  publicKey: string;
  createdAt: number;
  updatedAt: number;
  // Optional profile fields if the backend starts returning them later
  profileImg?: string | null;
  profile?: { img?: string | null } | null;
}


function lastN(s: string, n: number) {
  const t = s.trim();
  if (t.length <= n) return t;
  return t.slice(-n);
}

function shortKeyLabel(pk: string) {
  // show only last 6 chars to keep it human-checkable, never show full key by default
  const tail = lastN(pk, 6);
  return `…${tail}`;
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fallback
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

export default function UsersTable({ endpoint }: UsersTableProps) {
  const [rows, setRows] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTech, setShowTech] = useState(false);
  // QR modal state removed. Only 'copied' remains.
  const [copied, setCopied] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${endpoint}/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setRows(json.users ?? []);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [endpoint]);

  const getUserHostUrl = (username: string) => {
    const u = String(username || '').trim().toLowerCase();
    if (!u) return '';

    // Turn endpoint into a host (strip scheme + path) and then prefix with username.
    // Example:
    //   endpoint: http://localhost:8161  -> host: localhost:8161  -> username host: jabellae.localhost:8161
    //   endpoint: https://cleaker.me     -> host: cleaker.me      -> username host: jabellae.cleaker.me
    let host = String(endpoint || '').trim();
    host = host.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').replace(/\/+$/, '');
    if (!host) return '';

    // Preserve whether the caller is using https.
    const scheme = /^https:\/\//i.test(String(endpoint || '')) ? 'https://' : 'http://';
    return `${scheme}${u}.${host}`;
  };

  const getQrUrlForUser = (u: UserEntry) => {
    const pk = String(u.publicKey || '').trim();
    if (!pk) return '';
    const base = String(endpoint || '').replace(/\/+$/, '');
    return `${base}/?pk=${encodeURIComponent(pk)}`;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
     
        </Typography>
        <Tooltip title={showTech ? 'Hide advanced columns' : 'Show advanced columns'}>
          <IconButton
            size="small"
            onClick={() => setShowTech((v) => !v)}
            aria-label={showTech ? 'Hide advanced columns' : 'Show advanced columns'}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'background.paper',
              width: 32,
              height: 32,
              '& .material-symbols-rounded': { fontSize: 18 },
            }}
          >
            <Icon name="settings" fontSize={18 as any} />
          </IconButton>
        </Tooltip>
      </Box>

      {loading && (
        <Box sx={{ borderRadius: 2, p: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
            Loading users…
          </Typography>
        </Box>
      )}

      {error && (
        <Box sx={{ mb: 2, borderRadius: 2, p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'error.main' }}>
          <Typography variant="body2" sx={{ color: 'error.main' }}>
            {error}
          </Typography>
        </Box>
      )}

      {!loading && !error && rows.length === 0 && (
        <Box sx={{ borderRadius: 2, p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No users registered in this blockchain.
          </Typography>
        </Box>
      )}

      {rows.length > 0 && (
        <Box
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            background: 'background.nav',
            overflow: 'hidden',
          }}
        >
          <Table
            size="small"
            sx={{
              '& th, & td': { borderColor: 'divider' },
              '& tbody tr:hover': { bgcolor: 'action.hover' },
            }}
          >


            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.username} hover>
                  {/* Mini QR cell */}
                                   {/* Scan / QR tooltip trigger (low-noise) */}
                  <TableCell sx={{ width: 34, px: 0.5 }}>
                    {(() => {
                      const pk = String(r.publicKey || '').trim();
                      const hasPk = pk.length > 0;

                      const trigger = (
                        <IconButton
                          size="small"
                          disabled={!hasPk}
                          aria-label={hasPk ? 'Show QR' : 'No public key'}
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            bgcolor: 'transparent',
                            border: 'none',
                            color: 'primary.main',
                            opacity: hasPk ? 1 : 0.35,
                            '&:hover': { bgcolor: 'transparent' },
                            '& .material-symbols-rounded': { fontSize: 22 },
                          }}
                        >
                          <Icon name="fingerprint" fontSize={22 as any} />
                        </IconButton>
                      );

                      if (!hasPk) return trigger;

                      return (
                        <Tooltip
                          placement="right"
                          arrow
                          enterDelay={120}
                          leaveDelay={80}
                          slotProps={{
                            tooltip: {
                              sx: {
                                bgcolor: 'background.paper',
                                color: 'text.primary',
                                border: '1px solid',
                                borderColor: 'divider',
                                boxShadow: 6,
                                p: 1.25,
                                '& .MuiTooltip-arrow': {
                                  color: 'background.paper',
                                },
                              },
                            },
                          }}
                          title={
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                alignItems: 'center',
                                ['--qr-fg' as any]: 'currentColor',
                              }}
                            >
                              {(() => {
                                const url = getQrUrlForUser(r);
                                return (
                                  <Box
                                    sx={{
                                      color: 'primary.main',
                                      borderRadius: 2,
                                      p: 0.75,
                                      bgcolor: 'background.nav',
                                      border: '1px solid',
                                      borderColor: 'divider',
                                    }}
                                  >
                                    <QR
                                      value={url}
                                      size={144}
                                      bg="transparent"
                                      fg="var(--qr-fg, currentColor)"
                                      moduleRadius={0}
                                      caption={undefined}
                                      ecc="H"
                                      embedMode="positive-overlay"
                                      embedScale={0.36}
                                      embedBitmap={ME_EMBED_BITMAP}
                                    />
                                  </Box>
                                );
                              })()}
                            </Box>
                          }
                        >
                          {trigger}
                        </Tooltip>
                      );
                    })()}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, color: 'text.primary', pl: 0.25 }}>
                    {(() => {
                      const img =
                        (r as any)?.profileImg ??
                        (r as any)?.profile?.img ??
                        (r as any)?.profile?.pic ??
                        (r as any)?.profilePic ??
                        null;

                      const fallback = String(r.username || '?').slice(0, 1).toUpperCase();
                      const href = getUserHostUrl(r.username);

                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Avatar
                            src={img ? String(img) : undefined}
                            alt={String(r.username || 'user')}
                            sx={{
                              width: 28,
                              height: 28,
                              fontSize: 12,
                              fontWeight: 700,
                              bgcolor: 'background.paper',
                              border: '1px solid',
                              borderColor: 'divider',
                              flexShrink: 0,
                            }}
                          >
                            {fallback}
                          </Avatar>

                          {href ? (
                            <Box
                              component="a"
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              sx={{
                                color: 'text.primary',
                                textDecoration: 'none',
                                '&:visited': { color: 'text.primary', textDecoration: 'none' },
                                '&:active': { color: 'text.primary', textDecoration: 'none' },
                                '&:focus': { outline: 'none', textDecoration: 'none' },
                                '&:focus-visible': {
                                  outline: '2px solid',
                                  outlineColor: 'divider',
                                  outlineOffset: 2,
                                  borderRadius: 6,
                                  textDecoration: 'none',
                                },
                                fontWeight: 600,
                                cursor: 'pointer',
                                '&:hover': { textDecoration: 'none' },
                              }}
                              title={href}
                            >
                              {`@${r.username}`}
                            </Box>
                          ) : (
                            <Typography sx={{ fontWeight: 600 }}>{`@${r.username}`}</Typography>
                          )}
                        </Box>
                      );
                    })()}
                  </TableCell>
                  {showTech && (
                    <TableCell
                      sx={{
                        fontSize: 12,
                        color: 'text.secondary',
                        fontFamily: 'monospace',
                        maxWidth: 120,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={r.identityHash}
                    >
                      {r.identityHash}
                    </TableCell>
                  )}
                  {showTech && (
  <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>
    {(() => {
      const pk = String(r.publicKey || '').trim();
      const hasPk = pk.length > 0;
      const label = hasPk ? shortKeyLabel(pk) : '—';

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Typography
            variant="body2"
            sx={{
              fontSize: 12,
              color: 'text.secondary',
              fontFamily: 'monospace',
              userSelect: 'none',
            }}
            title={hasPk ? 'Public key (hidden). Use copy/QR.' : 'No public key'}
          >
            {label}
          </Typography>

          {hasPk ? (
            <Tooltip title={copied ? 'Copied!' : 'Copy full public key'}>
              <IconButton
                size="small"
                onClick={async () => {
                  const ok = await copyToClipboard(pk);
                  if (ok) {
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 900);
                  }
                }}
                aria-label="Copy public key"
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  width: 28,
                  height: 28,
                  '& .material-symbols-rounded': { fontSize: 18 },
                }}
              >
                <Icon name="content_copy" fontSize={18 as any} />
              </IconButton>
            </Tooltip>
          ) : null}
        </Box>
      );
    })()}
  </TableCell>
)}
                  {showTech && (
                    <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>
                      {new Date(r.createdAt).toLocaleString()}
                    </TableCell>
                  )}
                  {showTech && (
                    <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>
                      {new Date(r.updatedAt).toLocaleString()}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

    </Box>
  );
}