import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Box, Button, Typography } from '@/gui/atoms/atoms';
import { Modal } from '@/gui/molecules/molecules';
import { useFaceLandmarker } from './modules/useFaceLandmarker';
import { useFaceCameraPermission } from './modules/useFaceCameraPermission';
import { useFaceOverlay } from './modules/useFaceOverlay';
import { useFaceTemplate } from './modules/useFaceTemplate';
import { verifyTemplateRequest } from './modules/verifyTemplate';
import type { VerifyTemplateArgs } from './modules/verifyTemplate';
import type { FaceTemplate as FaceTemplateType } from './modules/useFaceTemplateBurst';

// --- Option A face template/verification types ---
export type FaceTemplate = FaceTemplateType;
export type VerifyResponse = { match: boolean; userId?: string; score?: number; } & Record<string, any>;

export type FaceRecognitionProps = {
  open: boolean;
  onClose: () => void;
  /** base64 data URL (jpeg) */
  onCapture?: (imageDataUrl: string) => void;
  /** Optional title for the modal */
  title?: string;
  /** Render style: modal (default) or inline camera-only */
  variant?: 'modal' | 'inline';
  /** Draw face landmarks overlay (inline mode). Placeholder detector until MediaPipe/TFJS is wired. */
  showLandmarks?: boolean;
  /** Option A: verify endpoint URL (default: /api/face/verify) */
  verifyUrl?: string;
  /** Option A: called with verification result */
  onVerify?: (result: any) => void;
  /** Option A: automatically verify after stable burst (default: true) */
  autoVerify?: boolean;
  /** If true, the component will include blendshapes in the template payload sent to verify/enroll. */
  includeBlendshapes?: boolean;
  /** Draw connection strokes between mesh points (default: true when mesh is available) */
  showMeshConnections?: boolean;
  /** Draw density for mesh points. 1 = full 468 points, 2 = every other, etc. (default: 1) */
  meshStep?: number;
  /** Mirror overlay coordinates to match a mirrored preview. Default: true. */
  mirrorPreview?: boolean;
  /** Externally-driven: If provided, triggers auto-verify with this template or object. */
  verifyPayload?: any;
  /** Externally-driven: App-level verification status (preferred over HTTP semantics). */
  verifyStatus?: string | null;
  /** Externally-driven: Transport HTTP status (optional, used only for debugging). */
  verifyHttpStatus?: number | null;
  /** Externally-driven: Provide a message for verification status badge. */
  verifyMessage?: string | null;
  /** Externally-driven: Called with stable template when available. */
  onTemplate?: (template: FaceTemplate | null) => void;
  /** Optional: emit status updates (http status/message/busy) to parent while verifying. */
  onStatus?: (
    next:
      | { httpStatus?: number | null; message?: string | null; busy?: boolean }
      | null
  ) => void;
};

export default function FaceRecognition({
  open,
  onClose,
  onCapture,
  title = 'Face Scan',
  variant = 'modal',
  showLandmarks: propShowLandmarks,
  verifyUrl = '/api/face/verify',
  onVerify,
  autoVerify = true,
  includeBlendshapes = false,
  showMeshConnections,
  meshStep = 1,
  mirrorPreview = true,
  verifyPayload,
  verifyStatus: externalVerifyStatus,
  verifyHttpStatus: externalVerifyHttpStatus,
  verifyMessage: externalVerifyMessage,
  onTemplate,
  onStatus,
}: FaceRecognitionProps) {
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastRealPointsRef = useRef<{ x: number; y: number }[] | null>(null);
  const lastBlendshapesRef = useRef<Array<{ categoryName: string; score: number }> | null>(null);
  const lastHudAnchorRef = useRef<{ x: number; y: number } | null>(null);
  // --- Option A: template refs ---
  const lastStableTemplateRef = useRef<FaceTemplate | null>(null);
  const autoVerifyTriggeredRef = useRef<boolean>(false);

  // --- Option A: verification state ---
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyResponse | null>(null);
  const [verifyStatusLocal, setVerifyStatusLocal] = useState<string | null>(null);
  const [verifyHttpStatusLocal, setVerifyHttpStatusLocal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Prefer external app-level status/message if provided
  const effectiveVerifyStatus = externalVerifyStatus !== undefined ? externalVerifyStatus : verifyStatusLocal;
  // Transport status is optional (debug). If parent passes it, prefer it.
  const effectiveVerifyHttpStatus = externalVerifyHttpStatus !== undefined ? externalVerifyHttpStatus : verifyHttpStatusLocal;
  const effectiveVerifyMessage = externalVerifyMessage ?? (verifyError || null);

  // Camera permission and face landmarker state via hooks
  const { permissionState } = useFaceCameraPermission({ enabled: open });

  // Determine showLandmarks default: true if inline and undefined, else false
  const showLandmarks = propShowLandmarks !== undefined ? propShowLandmarks : variant === 'inline';

  const {
    faceLandmarker,
    faceLandmarkerLoading,
    faceLandmarkerError,
  } = useFaceLandmarker({
    // Keep the MediaPipe runtime loaded while the modal/inline scanner is open.
    // This avoids flicker caused by repeatedly attaching/detaching the landmarker.
    enabled: open,
  });

  const [hasFace, setHasFace] = useState<boolean>(false);
  // Keep preview + overlay mirroring deterministic and identical.
  // If you want non-mirror behavior, pass mirrorPreview={false}.
  const MIRROR_PREVIEW = mirrorPreview;

  // --- Derived: verification target label for display ---
  const verifyTargetLabel = React.useMemo(() => {
    try {
      const u = new URL(verifyUrl, window.location.origin);
      // Only show hostname (no protocol, no port)
      return u.hostname;
    } catch {
      // If it's a relative path (e.g. /faces/match), fall back to current hostname
      return window.location.hostname;
    }
  }, [verifyUrl]);

  const videoConstraints = useMemo(
    () => ({
      facingMode: 'user' as const,
      width: { ideal: 720 },
      height: { ideal: 720 },
    }),
    []
  );

  const handleCapture = () => {
    setError(null);
    const cam = webcamRef.current;
    if (!cam) {
      setError('Camera not ready');
      return;
    }

    const imageDataUrl = cam.getScreenshot();
    if (!imageDataUrl) {
      setError('Could not capture image. Please ensure the camera is allowed.');
      return;
    }

    onCapture?.(imageDataUrl);
  };

  const getVideoEl = (): HTMLVideoElement | undefined => webcamRef.current?.video as HTMLVideoElement | undefined;



  // --- Option A: verification call ---
  const verifyTemplate = useCallback(
    async (template: FaceTemplate) => {
      setVerifyLoading(true);
      setVerifyError(null);
      setVerifyResult(null);
      setVerifyHttpStatusLocal(null);

      const out = await verifyTemplateRequest({
        verifyUrl,
        payload: {
          template,
          version: includeBlendshapes ? 'mp_fmesh_v2_bs' : 'mp_fmesh_v2',
          includeBlendshapes,
        },
        onStatus,
        // App-level semantics should come from JSON (status fields), not HTTP codes.
        treat404AsNotFound: false,
      } satisfies VerifyTemplateArgs<any>);

      // Mirror transport status into local state (debug/hud).
      setVerifyHttpStatusLocal(out.status ?? null);

      if (out.ok) {
        // Prefer app-level status if server returns it (e.g. FACE_NOT_ENROLLED, OK, USER_NOT_FOUND).
        const appStatus = (out.data as any)?.status ?? (out.data as any)?.code ?? null;
        setVerifyStatusLocal(appStatus ? String(appStatus) : null);

        setVerifyResult(out.data as any);
        onVerify?.(out.data);
      } else {
        // On error we may only have an Error + status.
        // App-level semantics should come from JSON on 200.
        setVerifyStatusLocal(null);

        const msg = out.error?.message || 'Verification failed';
        setVerifyError(String(msg));
      }

      setVerifyLoading(false);
    },
    [verifyUrl, onVerify, includeBlendshapes, onStatus]
  );

  const { stableTemplate } = useFaceTemplate({
    enabled: open && showLandmarks && hasFace,
    hasFace,
    pointsRef: lastRealPointsRef,
    blendshapesRef: lastBlendshapesRef,
    includeBlendshapes,
    burstSize: 15,
    intervalMs: 60,
    onTemplate: (tpl) => {
      // keep existing ref semantics for Verify button + auto-verify
      lastStableTemplateRef.current = tpl;
      autoVerifyTriggeredRef.current = false;
      onTemplate?.(tpl);
    },
  });

  // Reset verification/template state when the scanner is closed or landmarks are disabled.
  useEffect(() => {
    if (open && showLandmarks) return;
    lastStableTemplateRef.current = null;
    autoVerifyTriggeredRef.current = false;
    setVerifyResult(null);
    setVerifyError(null);
    setVerifyLoading(false);
    setVerifyStatusLocal(null);
    setVerifyHttpStatusLocal(null);
    onStatus?.(null);
    onTemplate?.(null);
  }, [open, showLandmarks, onStatus, onTemplate]);
  // --- Option A: auto-verify on external payload ---
  useEffect(() => {
    if (!autoVerify) return;
    if (!open || !showLandmarks) return;
    if (!verifyPayload) return;
    if (!hasFace) return;

    // If parent provides a payload, we verify it (parent can manage HTTP status display too).
    if (Array.isArray(verifyPayload) && verifyPayload.length) {
      verifyTemplate(verifyPayload as FaceTemplate);
      return;
    }
    if (Array.isArray((verifyPayload as any)?.template)) {
      verifyTemplate((verifyPayload as any).template as FaceTemplate);
      return;
    }
    // otherwise ignore
  }, [autoVerify, open, showLandmarks, verifyPayload, verifyTemplate, hasFace]);

  // --- Option A: auto-verify on stable template ---
  useEffect(() => {
    if (!autoVerify || !open || !showLandmarks) return;
    if (verifyLoading) return;
    if (!hasFace) return;
    const stable = lastStableTemplateRef.current;
    if (stable && !autoVerifyTriggeredRef.current) {
      autoVerifyTriggeredRef.current = true;
      verifyTemplate(stable);
    }
    // eslint-disable-next-line
  }, [autoVerify, open, showLandmarks, verifyLoading, hasFace]);



  useFaceOverlay({
    // Only run the overlay loop when we actually have a landmarker instance.
    // Running the loop while it's still loading can cause intermittent "no face" flicker.
    enabled: open && showLandmarks && !!faceLandmarker,
    canvasRef,
    getVideoEl,
    faceLandmarker,
    faceLandmarkerLoading,
    faceLandmarkerError,
    variant,
    mirrorPreview: MIRROR_PREVIEW,
    showMeshConnections,
    meshStep,
    // Wire state/refs back into FaceRecognition for template extraction + HUD.
    onHasFaceChange: setHasFace,
    onPoints: (pts) => {
      lastRealPointsRef.current = pts;
    },
    onBlendshapes: (bs) => {
      lastBlendshapesRef.current = bs;
    },
    onHudAnchor: (anchor) => {
      lastHudAnchorRef.current = anchor;
    },
  });


  // --- Option A: status badge under canvas (modal + inline) ---
  // In inline mode, we render a tiny HUD chip over the forehead area to feel “merged” into the mesh.
  const renderStatusBadge = () => {
    if (!showLandmarks) return null;

    // If we have a live landmark anchor, pin the HUD to it.
    // NOTE: We map normalized (0..1) landmark coordinates into the same cover/contain fit used by the canvas.
    const getHudStyle = (): any => {
      const videoNow = getVideoEl();
      const canvasNow = canvasRef.current;
      const anchor = lastHudAnchorRef.current;

      if (!videoNow || !canvasNow || !anchor) {
        return {
          position: 'absolute',
          top: 6,
          left: '50%',
          transform: 'translateX(-50%)',
        };
      }

      const vw = videoNow.videoWidth || 0;
      const vh = videoNow.videoHeight || 0;
      if (!vw || !vh) {
        return {
          position: 'absolute',
          top: 6,
          left: '50%',
          transform: 'translateX(-50%)',
        };
      }

      const rect = canvasNow.getBoundingClientRect();
      const cw = rect.width || canvasNow.width || 0;
      const ch = rect.height || canvasNow.height || 0;
      if (!cw || !ch) {
        return {
          position: 'absolute',
          top: 6,
          left: '50%',
          transform: 'translateX(-50%)',
        };
      }

      const fitMode = variant === 'inline' ? 'cover' : 'contain';
      const scale = fitMode === 'cover' ? Math.max(cw / vw, ch / vh) : Math.min(cw / vw, ch / vh);
      const drawW = vw * scale;
      const drawH = vh * scale;
      const offsetX = (cw - drawW) / 2;
      const offsetY = (ch - drawH) / 2;

      // Mirror to match canvas mapping
      const isMirrored = MIRROR_PREVIEW;
      const ax = isMirrored ? (1 - anchor.x) : anchor.x;
      const ay = anchor.y;

      const px = offsetX + (ax * vw) * scale;
      const py = offsetY + (ay * vh) * scale;

      // Nudge slightly upward so it sits on the forehead rather than inside the mask.
      const nudgeY = -10;

      return {
        position: 'absolute',
        left: `${px}px`,
        top: `${py + nudgeY}px`,
        transform: 'translate(-50%, -50%)',
      };
    };

    // Determine a compact label + tone
    let label: string | null = null;
    let tone: 'warn' | 'error' | 'success' | 'neutral' = 'neutral';

    // Highest priority: explicit app-level status from parent (Triad)
    if (hasFace && !verifyLoading && !verifyResult && effectiveVerifyStatus) {
      const s = String(effectiveVerifyStatus).toUpperCase();
      if (s === 'FACE_NOT_ENROLLED' || s === 'NOT_ENROLLED') {
        label = 'NEW';
        tone = 'warn';
      } else if (s === 'USER_NOT_FOUND') {
        label = 'NOUSER';
        tone = 'error';
      } else if (s !== 'OK') {
        // Unknown/non-OK app status
        label = s.length > 6 ? s.slice(0, 6) : s;
        tone = 'error';
      }
    } else if (verifyLoading) {
      // Verifying state is shown as a fixed footer label instead of the HUD chip.
      label = null;
    } else if (hasFace && verifyError) {
      // Prefer showing transport status if available, otherwise ERR.
      label = effectiveVerifyHttpStatus ? String(effectiveVerifyHttpStatus) : 'ERR';
      tone = 'error';
    } else if (verifyResult) {
      if (verifyResult.match) {
        label = '✓';
        tone = 'success';
      } else {
        label = '×';
        tone = 'warn';
      }
    }

    if (!label) return null;

    const borderColor =
      tone === 'success'
        ? 'rgba(102,187,106,0.95)'
        : tone === 'warn'
        ? 'rgba(244,67,54,0.95)'
        : tone === 'error'
        ? 'rgba(229,115,115,0.95)'
        : 'rgba(255,255,255,0.55)';

    const textColor =
      tone === 'success'
        ? 'rgba(102,187,106,0.95)'
        : tone === 'warn'
        ? 'rgba(244,67,54,0.95)'
        : tone === 'error'
        ? 'rgba(229,115,115,0.95)'
        : 'rgba(255,255,255,0.9)';
    const tooltipText =
      effectiveVerifyMessage ||
      (effectiveVerifyStatus ? String(effectiveVerifyStatus) : null);

    // Tiny HUD chip near forehead/top-center
    return (
      <Box
        title={tooltipText || undefined}
        sx={{
          ...getHudStyle(),
          px: 0.75,
          py: 0.15,
          borderRadius: 999,
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: 0.2,
          color: textColor,
          bgcolor: 'transparent',
          border: '1px solid',
          borderColor,
          boxShadow: 'none',
          userSelect: 'none',
          pointerEvents: 'none',
          lineHeight: 1.2,
        }}
      >
        {label}
      </Box>
    );
  };

  // --- Inline: no buttons, just camera and badge ---
  if (variant === 'inline') {
    return (
      <Box sx={{ width: '100%' }}>
        <Box
          sx={{
            width: '100%',
            position: 'relative',
            aspectRatio: '1 / 1',
            overflow: 'hidden',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.default',
          }}
        >
          <Webcam
            audio={false}
            mirrored={MIRROR_PREVIEW}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.92}
            videoConstraints={videoConstraints}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0 }}
            onUserMedia={() => setError(null)}
            onUserMediaError={() => setError('Could not access camera. Check permissions and try again.')}
          />
          {showLandmarks ? (
            <>
              <canvas
                ref={canvasRef}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 4,
                  left: 4,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 700,
                  userSelect: 'none',
                }}
              >
                {faceLandmarkerLoading
                  ? 'Loading face model…'
                  : faceLandmarkerError
                  ? 'Face model not loaded (placeholder)'
                  : hasFace
                  ? ''
                  : 'No face'}
              </Box>
            </>
          ) : null}
          {/* Verification destination label (bottom left) */}
          {verifyLoading ? (
            <Box
              sx={{
                position: 'absolute',
                left: 8,
                bottom: 8,
                px: 1,
                py: 0.5,
                borderRadius: 1,
                bgcolor: 'rgba(0,0,0,0.55)',
                color: 'white',
                fontSize: 10,
                fontWeight: 700,
                userSelect: 'none',
                pointerEvents: 'none',
                maxWidth: 'calc(100% - 16px)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {`Verifying → ${verifyTargetLabel}`}
            </Box>
          ) : null}
          {renderStatusBadge()}
        </Box>
        {error ? (
          <Typography sx={{ mt: 1, fontSize: 12, color: 'error.main' }}>
            {error}
          </Typography>
        ) : null}
      </Box>
    );
  }

  // --- Modal: camera, badge, and modal-specific controls ---
  return (
    <Modal open={open} onClose={onClose} aria-labelledby="face-scan-modal">
      <Box
        sx={(theme) => ({
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(92vw, 420px)',
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 24,
        })}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Typography fontWeight={800} sx={{ fontSize: 14 }}>
            {title}
          </Typography>
          <Button
            variant="text"
            size="small"
            onClick={onClose}
            sx={{
              minWidth: 32,
              width: 32,
              height: 32,
              p: 0,
              borderRadius: 2,
            }}
            aria-label="Close face scan"
          >
            ✕
          </Button>
        </Box>

        <Box sx={{ p: 2 }}>
        <Box
          sx={{
            width: '100%',
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.default',
            position: 'relative',
            aspectRatio: '1 / 1',
          }}
        >
          <Webcam
            audio={false}
            mirrored={MIRROR_PREVIEW}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.92}
            videoConstraints={videoConstraints}
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', opacity: 0 }}
            onUserMedia={() => setError(null)}
            onUserMediaError={() => setError('Could not access camera. Check permissions and try again.')}
          />
          {showLandmarks ? (
            <>
              <canvas
                ref={canvasRef}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 4,
                  left: 4,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 700,
                  userSelect: 'none',
                }}
              >
                {faceLandmarkerLoading
                  ? 'Loading face model…'
                  : faceLandmarkerError
                  ? 'Face model not loaded (placeholder)'
                  : hasFace
                  ? ''
                  : 'No face'}
              </Box>
            </>
          ) : null}
          {/* Verification destination label (bottom left) */}
          {verifyLoading ? (
            <Box
              sx={{
                position: 'absolute',
                left: 8,
                bottom: 8,
                px: 1,
                py: 0.5,
                borderRadius: 1,
                bgcolor: 'rgba(0,0,0,0.55)',
                color: 'white',
                fontSize: 10,
                fontWeight: 700,
                userSelect: 'none',
                pointerEvents: 'none',
                maxWidth: 'calc(100% - 16px)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {`Verifying → ${verifyTargetLabel}`}
            </Box>
          ) : null}
          {renderStatusBadge()}
        </Box>

          {error ? (
            <Typography sx={{ mt: 1, fontSize: 12, color: 'error.main' }}>
              {error}
            </Typography>
          ) : null}

          <Box
            sx={{
              mt: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            {!showLandmarks ? (
              <Button
                variant="contained"
                onClick={handleCapture}
                disabled={permissionState === 'denied'}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 800,
                }}
              >
                Capture
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={() => {
                  const tpl = lastStableTemplateRef.current;
                  if (tpl) {
                    verifyTemplate(tpl);
                  }
                }}
                disabled={
                  permissionState === 'denied' ||
                  !lastStableTemplateRef.current ||
                  verifyLoading
                }
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 800,
                }}
              >
                Verify
              </Button>
            )}
            <Button
              variant="text"
              onClick={onClose}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              Cancel
            </Button>
          </Box>

          <Typography sx={{ mt: 1.5, fontSize: 11, opacity: 0.75, textAlign: 'center' }}>
            Center your face inside the frame.
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
}