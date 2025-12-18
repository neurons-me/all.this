import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useGuiTheme } from '@/gui/hooks';
import Box from '@/gui/atoms/Box/Box';
import TextField from "@/gui/components/atoms/TextField/TextField";
import Icon from "@/gui/Theme/Icon/Icon";
import Button from '@/gui/components/atoms/Button/Button';
import Tooltip from '@/gui/components/atoms/Tooltip/Tooltip';
import { useBlockchainConnection } from "@/gui/components/organisms/Blockchain/scripts/connection";
import { deriveIdentity } from "./identity";
import QR from "./QR";
import ME from "this.me";
import FaceRecognition from '../FaceRecognition/FaceRecognition';

export default function Triad() {
  const theme = useGuiTheme();

  // Username typed in the UI (raw text).
  const [username, setUsername] = useState("");

  // If the user types an invalid username, we keep the raw text in `username`
  // but avoid feeding it into ME / network logic until it validates.
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Light, local validation to avoid exceptions from ME runtime.
  // (We keep this intentionally permissive; ME is the source of truth.)
  const validateUsername = useCallback((raw: string) => {
    const v = String(raw || '').trim().toLowerCase();
    if (!v) return { value: '', error: null as string | null };
    // Basic DNS-ish username: a-z 0-9 underscore dash dot, 3-32 chars.
    // This is just a UX guardrail; ME still validates on action.
    if (v.length < 5) return { value: v, error: 'Username too short' };
    if (v.length > 32) return { value: v, error: 'Username too long' };
    if (!/^[a-z0-9._-]+$/.test(v)) return { value: v, error: 'Only a-z 0-9 . _ -' };
    if (v.startsWith('.') || v.endsWith('.') || v.includes('..')) return { value: v, error: 'Invalid dots' };
    return { value: v, error: null as string | null };
  }, []);
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [blockchain, setBlockchain] = useState("localhost:8161");
  const [showIdentity, setShowIdentity] = useState(false);
  const [showLedgerBox, setShowLedgerBox] = useState(false);
  const [showFaceScan, setShowFaceScan] = useState(false);
  const [faceCapture, setFaceCapture] = useState<string | null>(null);
  const [showBlockchainInput, setShowBlockchainInput] = useState(false);
  const [lastFacePayload, setLastFacePayload] = useState<any | null>(null);
  const secretInputType = useMemo(() => (showSecret ? 'text' : 'password'), [showSecret]);
  // this.me runtime (local semantic + crypto)
  const me = useMemo(() => new ME(), []);
  // Helper: normalized username only when valid.

  // Mirror only blockchain host into ME (safe to do during typing).
  // Identity claim '@' and secret '_' are applied explicitly on action (Cleak it).
  // The hook provides blockchainHost and blockchainBaseUrl.
  const normalizedUsername = useMemo(() => {
    const { value, error } = validateUsername(username);
    return error ? '' : value;
  }, [username, validateUsername]);

  // Only hit the server once the username is valid AND long enough, and no local error.
  // (Also avoids calling while the user is still typing a short/invalid handle.)
  const shouldQueryServer = useMemo(() => {
    return Boolean(normalizedUsername) && normalizedUsername.length >= 5 && !usernameError;
  }, [normalizedUsername, usernameError]);

  // Gate the username we pass into the network hook.
  // When empty, the hook should not call the server.
  const networkUsername = shouldQueryServer ? normalizedUsername : '';

  const { blockchainHost, blockchainBaseUrl, connectionStatus, usernameStatus } = useBlockchainConnection({
    blockchain,
    username: networkUsername,
    me,
  });

  // server-derived identityHash for an existing username on this ledger
  const userIdentityHash = shouldQueryServer
    ? (me as any)(`ledger.user.${normalizedUsername}.identityHash`)
    : undefined;
    useEffect(() => {
    try {
      if (blockchainHost) (me as any).ledger.host(blockchainHost);
    } catch {
      // ignore
    }
  }, [me, blockchainHost]);
  const namespace = connectionStatus === 'online' && normalizedUsername
    ? `${normalizedUsername}@${blockchainHost}`
    : `${blockchainHost || 'blockchain:none'}`;
  const identity = useMemo(() => deriveIdentity({ secret, namespace }), [secret, namespace]);
  const cleak = identity.identityRoot;

  const [authStatus, setAuthStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle');
  const [authError, setAuthError] = useState<string | null>(null);

  const apiBaseUrl = useMemo(() => {
    const s = String(blockchainBaseUrl || blockchain || '').trim();
    if (!s) return '';
    return s.startsWith('http') ? s.replace(/\/$/, '') : `http://${s.replace(/\/$/, '')}`;
  }, [blockchainBaseUrl, blockchain]);

  // Face matching (server-backed). Used to drive an on-face label (e.g. 404 NOT ENROLLED).
  const [faceVerifyHttpStatus, setFaceVerifyHttpStatus] = useState<number | null>(null);
  const [faceVerifyMessage, setFaceVerifyMessage] = useState<string | null>(null);
  const [faceVerifyBusy, setFaceVerifyBusy] = useState(false);
  const [faceHasStableTemplate, setFaceHasStableTemplate] = useState(false);

  const facesMatchUrl = useMemo(() => {
    const base = String(apiBaseUrl || '').trim();
    return base ? `${base}/faces/match` : '';
  }, [apiBaseUrl]);

  const resetFaceVerify = useCallback(() => {
    setFaceVerifyHttpStatus(null);
    setFaceVerifyMessage(null);
    setFaceVerifyBusy(false);
    setLastFacePayload(null);
    setFaceHasStableTemplate(false);
  }, []);

  const runFaceMatch = useCallback(async (probeTemplate: any) => {
    if (!facesMatchUrl) {
      setFaceVerifyHttpStatus(500);
      setFaceVerifyMessage('NO MATCH URL');
      return;
    }
    if (!normalizedUsername) {
      setFaceVerifyHttpStatus(400);
      setFaceVerifyMessage('USERNAME REQUIRED');
      return;
    }
    // Accept either raw vector (number[]) or object containing { template: number[] }
    const tpl = probeTemplate;
    const probeVector = Array.isArray(tpl)
      ? tpl
      : Array.isArray((tpl as any)?.template)
        ? (tpl as any).template
        : null;

    if (!probeVector || probeVector.length < 8) {
      setFaceVerifyHttpStatus(400);
      setFaceVerifyMessage('INVALID TEMPLATE');
      return;
    }

    setFaceVerifyBusy(true);
    setFaceVerifyHttpStatus(102);
    setFaceVerifyMessage('VERIFYING…');

    try {
      const resp = await fetch(facesMatchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: normalizedUsername, template: tpl }),
      });

      const json = await resp.json().catch(() => null);
      if (!resp.ok) {
        if (resp.status === 404) {
          setFaceVerifyHttpStatus(404);
          // 404 from /faces/match means there is no enrolled face for this username yet.
          // For Cleaker UX, treat this as "available to claim".
          const cleanHost = String(blockchainHost || blockchain || 'localhost')
            .split(',')[0]
            .trim()
            .replace(/^https?:\/\//i, '')
            .split(':')[0]
            .trim();

          const claimLabel = normalizedUsername
            ? `AVAILABLE • CLAIM ${normalizedUsername}.${cleanHost}!`
            : 'AVAILABLE • CLAIM USERNAME!';
          setFaceVerifyMessage(claimLabel);
          return;
        }
        setFaceVerifyHttpStatus(resp.status);
        setFaceVerifyMessage(String(json?.error || json?.message || `HTTP ${resp.status}`));
        return;
      }

      const match = Boolean((json as any)?.match);
      const score = Number((json as any)?.score ?? (json as any)?.best?.score ?? 0);

      setFaceVerifyHttpStatus(match ? 200 : 401);
      setFaceVerifyMessage(match ? `MATCH ${score ? score.toFixed(3) : ''}`.trim() : `NO MATCH ${score ? score.toFixed(3) : ''}`.trim());
    } catch (e: any) {
      setFaceVerifyHttpStatus(500);
      setFaceVerifyMessage(String(e?.message || 'VERIFY ERROR'));
    } finally {
      setFaceVerifyBusy(false);
    }
  }, [facesMatchUrl, normalizedUsername, blockchainHost, blockchain]);


  const checkSecretMatches = useCallback(() => {
    // If the username exists on this ledger, the server returns the claimed identityHash.
    // We validate by recomputing identityHash from (secret, namespace) and comparing.
    if (usernameStatus !== 'exists') return true;
    if (!userIdentityHash) return false;
    return String(userIdentityHash).trim() === String(identity.identityRoot).trim();
  }, [usernameStatus, userIdentityHash, identity.identityRoot]);

  const handleCleak = useCallback(async () => {
    const { value: u, error: uErr } = validateUsername(username);
    if (!u || uErr) {
      setAuthStatus('error');
      setAuthError(uErr || 'Invalid username');
      return;
    }

    // Must be online to read/write to this ledger
    if (connectionStatus !== 'online') {
      setAuthStatus('error');
      setAuthError('Ledger is offline');
      return;
    }

    // Must have secret for both claim and verify.
    if (!secret) {
      setAuthStatus('error');
      setAuthError('Secret is required');
      return;
    }

    setAuthStatus('checking');
    setAuthError(null);

    // 1) If username exists -> verify secret matches
    if (usernameStatus === 'exists') {
      const ok = checkSecretMatches();
      if (!ok) {
        setAuthStatus('error');
        setAuthError('Secret does not match this username on this ledger');
        return;
      }

      // Apply ME algebra only when verified
      try { (me as any)['@'](u); } catch {}
      try { (me as any)['_'](secret); } catch {}

      setAuthStatus('ok');
      window.setTimeout(() => setAuthStatus('idle'), 900);
      return;
    }

    // 2) If username is available -> claim it (POST /users)
    if (usernameStatus !== 'available') {
      setAuthStatus('error');
      setAuthError('Username must be available to claim, or exist to verify');
      return;
    }

    // Apply ME algebra explicitly at action time.
    try { (me as any)['@'](u); } catch (e: any) {
      setAuthStatus('error');
      setAuthError(e?.message ?? 'Invalid username');
      return;
    }
    try { (me as any)['_'](secret); } catch (e: any) {
      setAuthStatus('error');
      setAuthError(e?.message ?? 'Invalid secret');
      return;
    }

    const identityHash = String(identity.identityRoot || '').trim();
    const publicKey = '0x';

    try {
      const resp = await fetch(`${apiBaseUrl}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, identityHash, publicKey }),
      });

      const payload = await resp.json().catch(() => null);
      if (!resp.ok) {
        const msg = payload?.error || payload?.message || `HTTP ${resp.status}`;
        throw new Error(msg);
      }

      setAuthStatus('ok');
      window.setTimeout(() => setAuthStatus('idle'), 900);
    } catch (e: any) {
      setAuthStatus('error');
      setAuthError(e?.message ?? 'Failed to claim username');
    }
  }, [apiBaseUrl, checkSecretMatches, connectionStatus, identity.identityRoot, me, secret, username, usernameStatus]);
  return (
    <>
      <Box
        sx={{
          border: `1px solid ${theme.palette.section.subtle}`,
          borderRadius: "12px",
          p: 1.5,
          width: "300px",
          mx: "auto",
          background:
            theme.palette.mode === "dark"
              ? theme.palette.section.default
              : theme.palette.section.subtle,
          position: "relative",
        }}
      >
          <Button
            variant="text"
            size="small"
            onClick={() => setShowBlockchainInput((v) => !v)}
            sx={{
              position: 'absolute',
              top: 6,
              right: 6,
              minWidth: '28px',
              width: '28px',
              height: '28px',
              p: 0,
              borderRadius: '8px',
              color:
                !blockchainHost || connectionStatus === 'idle'
                  ? theme.palette.divider
                  : connectionStatus === 'connecting'
                    ? 'yellow'
                    : connectionStatus === 'online'
                      ? 'green'
                      : 'red',
              '&:hover': {
                background: theme.palette.action.hover,
              },
            }}
            aria-label={showBlockchainInput ? 'Hide blockchain input' : 'Show blockchain input'}
          >
            <Icon name="dns" fontSize={18} />
          </Button>
          
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <pre style={{ margin: 0, padding: 0, lineHeight: "12px", fontSize: "12px", color: theme.palette.text.primary }}>
            {`
    ┓   ┏┓
 ┓┏┏┣┓┏┓┏┛
•┗┻┛┛┗┗┛•   
             `}
          </pre>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.25,
            mt: 1.75,
            width: "100%",
            px: 0.5,
          }}
        >
          {connectionStatus === 'online' && (
            <Box sx={{ display: "flex", gap: 1, mb: 0.25 }}>
              <TextField
                label="Username"
                variant="outlined"
                autoComplete="off"
                value={username}
                onChange={(e) => {
                  const next = e.target.value;
                  setUsername(next);
                  const { error } = validateUsername(next);
                  setUsernameError(error);
                }}
                error={Boolean(usernameError)}
                helperText={usernameError || undefined}
                fullWidth
                slotProps={{
                  htmlInput: {
                    autoCapitalize: 'none',
                    autoCorrect: 'off',
                    spellCheck: false,
                    inputMode: 'text',
                  },
                  input: {
                    endAdornment: (
                      <Box sx={{ display: 'flex', alignItems: 'center', pr: 0.25 }}>
                        <Tooltip
                          title="Create a new username by typing it, then check availability on this blockchain."
                          placement="top"
                          arrow
                        >
                          <Box
                            component="span"
                            sx={{
                              fontSize: '11px',
                              color: 'text.secondary',
                              opacity: 0.85,
                              cursor: 'help',
                              userSelect: 'none',
                              lineHeight: 1,
                            }}
                          >
                            new?
                          </Box>
                        </Tooltip>
                      </Box>
                    ),
                  },
                }}
                sx={{
                  '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
                    WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
                    WebkitTextFillColor: theme.palette.text.primary,
                    caretColor: theme.palette.text.primary,
                    transition: 'background-color 9999s ease-out 0s',
                  },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    position: 'relative',
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      right: 0,
                      width: '6px',
                      borderRadius: '0 10px 10px 0',
                      backgroundColor:
                        !username || usernameStatus === 'idle'
                          ? theme.palette.divider
                          : usernameStatus === 'checking'
                          ? 'yellow'
                          : usernameStatus === 'exists'
                          ? 'green'
                          : usernameStatus === 'available'
                          ? 'blue'
                          : 'red',
                      pointerEvents: 'none',
                      zIndex: 2,
                    }
                  }
                }}
              />
            </Box>
          )}

          {connectionStatus === 'online' && shouldQueryServer && usernameStatus === 'available' && (
            <Box sx={{ mt: -0.25, mb: 0.75, px: 1 }}>
              <span style={{ fontSize: '11px', color: theme.palette.text.secondary }}>
                Username is available. Follow steps to claim.
              </span>
            </Box>
          )}

          {(usernameStatus === 'exists' || usernameStatus === 'available') && (
            <TextField
              label="Secret"
              type={secretInputType}
              variant="outlined"
              autoComplete="new-password"
              value={secret}
              onChange={(e) => { setSecret(e.target.value); setAuthStatus('idle'); setAuthError(null); }}
              fullWidth
              slotProps={{
                htmlInput: {
                  autoCapitalize: 'none',
                  autoCorrect: 'off',
                  spellCheck: false,
                },
                input: {
                  endAdornment: (
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => setShowSecret((v) => !v)}
                      sx={{
                        minWidth: '32px',
                        p: 0,
                        mr: '-6px',
                        color: secret ? theme.palette.text.secondary : theme.palette.divider,
                      }}
                      aria-label={showSecret ? 'Hide secret' : 'Show secret'}
                    >
                      <Icon name={showSecret ? "visibility_off" : "visibility"} fontSize={18} fill={showSecret ? 1 : 0} />
                    </Button>
                  ),
                },
              }}
              sx={{
                '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
                  WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
                  WebkitTextFillColor: theme.palette.text.primary,
                  caretColor: theme.palette.text.primary,
                  transition: 'background-color 9999s ease-out 0s',
                },
              }}
            />
          )}

          {showBlockchainInput && (
            <TextField
              label="Blockchain"
              variant="outlined"
              autoComplete="off"
              slotProps={{
                htmlInput: {
                  autoCapitalize: 'none',
                  autoCorrect: 'off',
                  spellCheck: false,
                  inputMode: 'url',
                },
              }}
              value={blockchain}
              onChange={(e) => setBlockchain(e.target.value)}
              fullWidth
              sx={{
                '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
                  WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
                  WebkitTextFillColor: theme.palette.text.primary,
                  caretColor: theme.palette.text.primary,
                  transition: 'background-color 9999s ease-out 0s',
                },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  position: 'relative',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    right: 0,
                    width: '6px',
                    borderRadius: '0 10px 10px 0',
                    backgroundColor:
                      !blockchainHost || connectionStatus === 'idle'
                        ? theme.palette.divider
                        : connectionStatus === 'connecting'
                        ? 'yellow'
                        : connectionStatus === 'online'
                        ? 'green'
                        : 'red',
                    pointerEvents: 'none',
                    zIndex: 2,
                  }
                }
              }}
            />
          )}
        </Box>
      </Box>

      {secret && blockchain && (
        <>
          <Box
            sx={{
              mt: 2,
              p: 1.25,
              border: "1px solid rgba(0,255,255,0.3)",
              borderRadius: "12px",
              color: theme.palette.mode === "light" ? "#006677" : "#99faff",
              fontFamily: "monospace",
              wordBreak: "break-all",
              width: "300px",
              mx: "auto",
            }}
          >
          <Box
            sx={{
              mb: 1.25,
              overflow: 'hidden',
              borderRadius: '14px',
              background:
                theme.palette.mode === 'dark'
                  ? theme.palette.section.subtle
                  : theme.palette.section.default,
              border: `1px solid ${theme.palette.divider}`,
              width: '100%',
              position: 'relative',
            }}
          >
            <Button
              variant="text"
              size="small"
              onClick={() => setShowLedgerBox((prev) => !prev)}
              sx={{
                position: 'absolute',
                top: 6,
                right: 6,
                minWidth: '24px',
                width: '24px',
                height: '24px',
                p: 0,
                borderRadius: '8px',
                color: theme.palette.text.secondary,
                background: theme.palette.mode === 'dark'
                  ? 'rgba(0,0,0,0.25)'
                  : 'rgba(255,255,255,0.35)',
                backdropFilter: 'blur(6px)',
                '&:hover': {
                  background: theme.palette.action.hover,
                },
              }}
              aria-label={showLedgerBox ? 'Hide ledger box' : 'Show ledger box'}
            >
              <Icon name="info" fontSize={16} fill={showLedgerBox ? 1 : 0} />
            </Button>
            <Box
              sx={{
                pt: 0.35,
                pb: 0.75,
                px: 0.75,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.15,
                // cursor removed to make QR non-interactive
              }}
            >
              {showFaceScan ? (
                <>
                  <FaceRecognition
                    open={showFaceScan}
                    onClose={() => {
                      setShowFaceScan(false);
                      resetFaceVerify();
                    }}
                    onCapture={(img) => {
                      setFaceCapture(img);
                      setShowFaceScan(false);
                    }}
                    title="Face Scan"
                    variant="inline"
                    showLandmarks
                    verifyHttpStatus={faceVerifyHttpStatus}
                    verifyMessage={faceVerifyMessage}
                    onTemplate={(template: any) => {
                      // A template only exists when a face was detected and stabilized.
                      // If FaceRecognition ever emits a null/empty template, treat it as "no face".
                      if (!template || (Array.isArray(template) && template.length === 0)) {
                        setFaceHasStableTemplate(false);
                        setLastFacePayload(null);
                        resetFaceVerify();
                        return;
                      }

                      setFaceHasStableTemplate(true);
                      setLastFacePayload(template);

                      // Only run match when a stable template exists.
                      const now = Date.now();
                      const lastAt = (me as any)?.__lastFaceMatchAt || 0;
                      if (now - lastAt < 2000) return;
                      try { (me as any).__lastFaceMatchAt = now; } catch {}

                      runFaceMatch(template);
                    }}
                  />
                  <Box
                    sx={{
                      mt: 0.75,
                      px: 1,
                      py: 0.65,
                      borderRadius: '10px',
                      border: `1px solid ${theme.palette.divider}`,
                      color: theme.palette.text.secondary,
                      fontSize: '11px',
                      textAlign: 'center',
                      whiteSpace: 'pre-line',
                      userSelect: 'none',
                    }}
                  >
                    {faceVerifyBusy
                      ? 'Verifying…'
                      : !faceHasStableTemplate
                      ? 'Center your face'
                      : faceVerifyHttpStatus === 404
                      ? `Available\n${normalizedUsername || 'username'}.${String(blockchainHost || 'localhost').split(':')[0]}`
                      : faceVerifyHttpStatus
                      ? `${faceVerifyHttpStatus}${faceVerifyMessage ? ` • ${faceVerifyMessage}` : ''}`
                      : 'Center your face'}

                    <Box
                      sx={{
                        mt: 0.6,
                        display: 'flex',
                        gap: 0.75,
                        justifyContent: 'center',
                      }}
                    >
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => {
                          handleCleak();
                          setShowFaceScan(false);
                          resetFaceVerify();
                        }}
                        sx={{
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 800,
                          minWidth: '96px',
                        }}
                        disabled={faceVerifyBusy || !faceHasStableTemplate || faceVerifyHttpStatus !== 404}
                      >
                        Claim
                      </Button>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => {
                          setShowFaceScan(false);
                          resetFaceVerify();
                        }}
                        sx={{
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 700,
                        }}
                      >
                        Close
                      </Button>
                    </Box>
                  </Box>
                </>
              ) : (
                <QR
                  value={identity.identityRoot}
                  size={144}
                  fg={theme.palette.primary.main}
                  ecc="H"
                  embedMode="positive-overlay"
                  embedScale={0.36}
                  embedBitmap={[
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
                  ]}
                />
              )}
            </Box>
            {showLedgerBox && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  px: 1,
                  py: 0.35,
                  borderTop: `1px solid ${theme.palette.divider}`,
                  background:
                    theme.palette.mode === 'dark'
                      ? theme.palette.section.default
                      : theme.palette.section.subtle,
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 }}>
                  <span
                    style={{
                      fontSize: '9px',
                      lineHeight: '11px',
                      color: theme.palette.primary.main,
                      fontFamily: 'monospace',
                      letterSpacing: 0.2,
                      userSelect: 'text',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      opacity: 0.9,
                    }}
                    title={blockchainHost || 'blockchain:none'}
                  >
                    {blockchainHost || 'blockchain:none'}
                  </span>

                  <span
                    style={{
                      fontSize: '9px',
                      lineHeight: '11px',
                      color: theme.palette.text.secondary,
                      fontFamily: 'monospace',
                      letterSpacing: 0.2,
                      userSelect: 'text',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={identity.identityRoot}
                  >
                    {showIdentity
                      ? (identity.identityRoot || '')
                      : identity.identityRoot
                        ? `••••••••••••••••••••••••••${identity.identityRoot.slice(-4)}`
                        : '••••'}
                  </span>
                </Box>

                <Button
                  variant="text"
                  size="small"
                  onClick={() => setShowIdentity((prev) => !prev)}
                  sx={{
                    minWidth: '28px',
                    width: '28px',
                    height: '22px',
                    p: 0,
                    borderRadius: '8px',
                    color: theme.palette.text.secondary,
                    '&:hover': { background: theme.palette.action.hover },
                  }}
                  aria-label={showIdentity ? 'Hide identity' : 'Show identity'}
                >
                  <Icon
                    name={showIdentity ? 'visibility_off' : 'visibility'}
                    fontSize={16}
                    fill={showIdentity ? 1 : 0}
                  />
                </Button>
              </Box>
            )}
          </Box>

            {/* CTA */}
            {!showFaceScan ? (
              <>
                <Box
                  sx={{
                    mt: 0.75,
                    px: 1,
                    py: 0.75,
                    borderRadius: '12px',
                    border: `1px solid ${theme.palette.divider}`,
                    background:
                      theme.palette.mode === 'dark'
                        ? theme.palette.section.default
                        : theme.palette.section.subtle,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: '11px', color: theme.palette.text.primary, fontWeight: 700 }}>
                      Validate Identity.
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        color: theme.palette.text.secondary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={blockchainHost || 'blockchain:none'}
                    >
                      to claim a username on {blockchainHost || 'this blockchain'}
                    </span>
                  </Box>

                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      setAuthStatus('idle');
                      setAuthError(null);
                      resetFaceVerify();
                      setShowFaceScan(true);
                    }}
                    aria-label="Validate with face recognition"
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 700,
                      minWidth: '128px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    disabled={!secret || !normalizedUsername || !facesMatchUrl || faceVerifyBusy}
                  >
                    <Icon name="face_unlock" fontSize={20} fill={1} />
                  </Button>
                </Box>

                {authStatus === 'checking' ? (
                  <span style={{ fontSize: '11px', color: theme.palette.text.secondary, paddingLeft: 2 }}>
                    {usernameStatus === 'exists' ? 'Verifying secret…' : 'Claiming username…'}
                  </span>
                ) : null}

                {authStatus === 'error' && authError ? (
                  <span style={{ fontSize: '11px', color: theme.palette.error.main, paddingLeft: 2 }}>
                    {authError}
                  </span>
                ) : null}

                {authStatus === 'ok' ? (
                  <span style={{ fontSize: '11px', color: theme.palette.success.main, paddingLeft: 2 }}>
                    {usernameStatus === 'exists' ? 'Secret verified.' : 'Username claimed.'}
                  </span>
                ) : null}
              </>
            ) : null}
          </Box>
        </>
      )}
    </>
  );
}