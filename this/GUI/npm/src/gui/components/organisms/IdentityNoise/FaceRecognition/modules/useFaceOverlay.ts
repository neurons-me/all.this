import * as React from 'react';

export type FacePoint = { x: number; y: number };

export type UseFaceOverlayArgs = {
  /** Whether the overlay loop should run. Typically: open && showLandmarks */
  enabled: boolean;
  /** Ref to the overlay canvas */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** Getter for the underlying video element (from react-webcam) */
  getVideoEl: () => HTMLVideoElement | undefined;

  /** MediaPipe FaceLandmarker instance (or null). */
  faceLandmarker: any | null;
  /** Whether landmarker is currently loading. */
  faceLandmarkerLoading?: boolean;
  /** Whether landmarker failed to load. */
  faceLandmarkerError?: boolean;

  /** UI variant affects fit mode. inline => cover, modal => contain */
  variant?: 'modal' | 'inline';
  /** Mirror preview + overlay mapping. Default true */
  mirrorPreview?: boolean;

  /** Draw connection strokes between mesh points. Default: true when real mesh is present */
  showMeshConnections?: boolean;
  /** Draw density for mesh points. 1 = full 468 points, 2 = every other, etc. Default 1 */
  meshStep?: number;

  /** Detection throttle in ms. Lower = more responsive. Default 80. */
  detectThrottleMs?: number;
  /** How many consecutive misses before declaring no-face. Default 6 (lenient defaults bump this). */
  noFaceMissesToClear?: number;
  /** Grace window (ms) to keep last points after last seen face. Default 450 (lenient defaults bump this). */
  noFaceGraceMs?: number;
  /** Minimum time (ms) to hold a detected face before clearing. Helps avoid badge flicker. */
  minFaceHoldMs?: number;

  /** Optional: called whenever face presence changes */
  onHasFaceChange?: (hasFace: boolean) => void;
  /** Optional: called with latest landmark points (normalized 0..1, video space). null when none */
  onPoints?: (points: FacePoint[] | null) => void;
  /** Optional: called with latest blendshapes categories (if available). null when none */
  onBlendshapes?: (
    blendshapes: Array<{ categoryName: string; score: number }> | null
  ) => void;
  /** Optional: called with an anchor point suitable for HUD placement (normalized) */
  onHudAnchor?: (anchor: FacePoint | null) => void;
};

export type UseFaceOverlayResult = {
  hasFace: boolean;
  /** Latest real points from MediaPipe if available; otherwise null */
  lastPoints: FacePoint[] | null;
  /** Latest blendshapes if available */
  lastBlendshapes: Array<{ categoryName: string; score: number }> | null;
  /** Latest HUD anchor (normalized) */
  hudAnchor: FacePoint | null;
};

// Lightweight subset of MediaPipe FaceMesh connections (contours)
const MESH_CONNECTIONS: Array<[number, number]> = [
  // face oval
  [10, 338],
  [338, 297],
  [297, 332],
  [332, 284],
  [284, 251],
  [251, 389],
  [389, 356],
  [356, 454],
  [454, 323],
  [323, 361],
  [361, 288],
  [288, 397],
  [397, 365],
  [365, 379],
  [379, 378],
  [378, 400],
  [400, 377],
  [377, 152],
  [152, 148],
  [148, 176],
  [176, 149],
  [149, 150],
  [150, 136],
  [136, 172],
  [172, 58],
  [58, 132],
  [132, 93],
  [93, 234],
  [234, 127],
  [127, 162],
  [162, 21],
  [21, 54],
  [54, 103],
  [103, 67],
  [67, 109],
  [109, 10],
  // lips outer (approx)
  [61, 146],
  [146, 91],
  [91, 181],
  [181, 84],
  [84, 17],
  [17, 314],
  [314, 405],
  [405, 321],
  [321, 375],
  [375, 291],
  [291, 61],
  // nose ridge-ish
  [1, 2],
  [2, 98],
  [1, 5],
  [5, 4],
];

function detectPlaceholderLandmarksFromVideo(video: HTMLVideoElement): { points: FacePoint[] } | null {
  if (!video.videoWidth || !video.videoHeight) return null;
  // Simple normalized points roughly for eyes, nose, mouth
  const points: FacePoint[] = [
    { x: 0.35, y: 0.4 },
    { x: 0.65, y: 0.4 },
    { x: 0.5, y: 0.5 },
    { x: 0.4, y: 0.6 },
    { x: 0.6, y: 0.6 },
    { x: 0.3, y: 0.5 },
    { x: 0.7, y: 0.5 },
    { x: 0.5, y: 0.3 },
    { x: 0.45, y: 0.45 },
    { x: 0.55, y: 0.45 },
    { x: 0.5, y: 0.7 },
  ];
  return { points };
}

/**
 * useFaceOverlay
 *
 * Owns the requestAnimationFrame loop that:
 * - keeps canvas resolution in sync
 * - runs MediaPipe detectForVideo (throttled)
 * - draws mesh points + optional contour connections
 * - publishes latest points/blendshapes/hud anchor
 */
export function useFaceOverlay(args: UseFaceOverlayArgs): UseFaceOverlayResult {
  const {
    enabled,
    canvasRef,
    getVideoEl,
    faceLandmarker,
    faceLandmarkerLoading = false,
    faceLandmarkerError = false,
    variant = 'modal',
    mirrorPreview = true,
    showMeshConnections,
    meshStep = 1,
    detectThrottleMs = 80,
    // Smoother defaults: keep face “locked” longer to avoid flicker on brief misses.
    noFaceMissesToClear = 24,
    noFaceGraceMs = 1500,
    minFaceHoldMs = 1200,
    onHasFaceChange,
    onPoints,
    onBlendshapes,
    onHudAnchor,
  } = args;

  const rafRef = React.useRef<number | null>(null);
  const lastDetectTimeRef = React.useRef<number>(0);
  const lastFaceSeenAtRef = React.useRef<number>(0);
  const missCountRef = React.useRef<number>(0);
  const lastLogAtRef = React.useRef<number>(0);
  const lastFaceMarkedAtRef = React.useRef<number>(0);

  const lastRealPointsRef = React.useRef<FacePoint[] | null>(null);
  const lastBlendshapesRef = React.useRef<Array<{ categoryName: string; score: number }> | null>(
    null
  );
  const lastHudAnchorRef = React.useRef<FacePoint | null>(null);

  const [hasFace, setHasFace] = React.useState<boolean>(false);

  // Keep callbacks stable without re-wiring the RAF loop every render.
  const callbacksRef = React.useRef({ onHasFaceChange, onPoints, onBlendshapes, onHudAnchor });
  React.useEffect(() => {
    callbacksRef.current = { onHasFaceChange, onPoints, onBlendshapes, onHudAnchor };
  }, [onHasFaceChange, onPoints, onBlendshapes, onHudAnchor]);

  const setHasFaceSafe = React.useCallback(
    (next: boolean, force?: boolean) => {
      setHasFace((prev) => {
        // Min-hold: if we already have a face, don't drop it immediately unless forced.
        if (!next && prev && !force) {
          const now = performance.now();
          const heldFor = now - lastFaceMarkedAtRef.current;
          if (heldFor < Number(minFaceHoldMs ?? 0)) {
            return prev;
          }
        }

        if (prev !== next) callbacksRef.current.onHasFaceChange?.(next);
        if (next) lastFaceMarkedAtRef.current = performance.now();
        return next;
      });
    },
    [minFaceHoldMs]
  );

  React.useEffect(() => {
    if (!enabled) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setHasFaceSafe(false, true);
      lastFaceSeenAtRef.current = 0;
      missCountRef.current = 0;
      lastLogAtRef.current = 0;
      lastRealPointsRef.current = null;
      lastBlendshapesRef.current = null;
      lastHudAnchorRef.current = null;
      callbacksRef.current.onPoints?.(null);
      callbacksRef.current.onBlendshapes?.(null);
      callbacksRef.current.onHudAnchor?.(null);
      return;
    }

    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    let cancelled = false;

    async function draw() {
      if (cancelled) return;

      const canvasNow = canvasRef.current;
      if (!canvasNow) return;

      const videoNow = getVideoEl();

      // Sync canvas backing store size with CSS size for sharpness
      const rect = canvasNow.getBoundingClientRect();
      if (rect.width && rect.height && (canvasNow.width !== rect.width || canvasNow.height !== rect.height)) {
        canvasNow.width = rect.width;
        canvasNow.height = rect.height;
      }

      const ctx = canvasNow.getContext('2d');
      if (!ctx) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, canvasNow.width, canvasNow.height);

      const vw = videoNow?.videoWidth ?? 0;
      const vh = videoNow?.videoHeight ?? 0;
      const readyState = videoNow?.readyState ?? 0;
      const videoIsReady = !!videoNow && vw > 0 && vh > 0 && readyState >= 2;

      if (!videoIsReady) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      if (!videoNow || faceLandmarkerLoading) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      // --- Compute video-to-canvas mapping (cover/contain) ---
      const cw = canvasNow.width;
      const ch = canvasNow.height;
      const fitMode = variant === 'inline' ? 'cover' : 'contain';
      const scale = fitMode === 'cover' ? Math.max(cw / vw, ch / vh) : Math.min(cw / vw, ch / vh);
      const drawW = vw * scale;
      const drawH = vh * scale;
      const offsetX = (cw - drawW) / 2;
      const offsetY = (ch - drawH) / 2;

      const isMirrored = mirrorPreview;

      // --- Detection (throttled) ---
      const now = performance.now();
      const elapsed = now - lastDetectTimeRef.current;
      const throttleMs = Math.max(16, Number(detectThrottleMs ?? 80));

      if (!faceLandmarkerError && faceLandmarker && elapsed > throttleMs) {
        lastDetectTimeRef.current = now;
        try {
          const mpResult = faceLandmarker.detectForVideo(videoNow, now);
            const has = !!(mpResult && mpResult.faceLandmarks && mpResult.faceLandmarks.length > 0);

            if (has) {
              missCountRef.current = 0;
              lastFaceSeenAtRef.current = now;
              lastFaceMarkedAtRef.current = now;

            const rawPoints = mpResult.faceLandmarks[0];
            const points: FacePoint[] = rawPoints.map((p: any) => ({ x: p.x, y: p.y }));
            lastRealPointsRef.current = points;

            const forehead = points[10] || points[9] || points[8] || { x: 0.5, y: 0.12 };
            lastHudAnchorRef.current = { x: forehead.x, y: forehead.y };

            const bs = (mpResult as any)?.faceBlendshapes?.[0]?.categories;
            if (Array.isArray(bs) && bs.length) {
              lastBlendshapesRef.current = bs.map((c: any) => ({
                categoryName: String(c.categoryName ?? ''),
                score: Number(c.score ?? 0),
              }));
            } else {
              lastBlendshapesRef.current = null;
            }

            setHasFaceSafe(true);
            callbacksRef.current.onPoints?.(points);
            callbacksRef.current.onBlendshapes?.(lastBlendshapesRef.current);
            callbacksRef.current.onHudAnchor?.(lastHudAnchorRef.current);
          } else {
            // Hysteresis: don't drop face immediately on a single miss.
            missCountRef.current += 1;

            const lastSeen = lastFaceSeenAtRef.current || 0;
            const withinGrace = lastSeen > 0 && (now - lastSeen) < Number(noFaceGraceMs ?? 450);
            const missesNeeded = Math.max(1, Number(noFaceMissesToClear ?? 6));

            if (!withinGrace && missCountRef.current >= missesNeeded) {
              setHasFaceSafe(false);
              lastRealPointsRef.current = null;
              lastBlendshapesRef.current = null;
              lastHudAnchorRef.current = null;
              callbacksRef.current.onPoints?.(null);
              callbacksRef.current.onBlendshapes?.(null);
              callbacksRef.current.onHudAnchor?.(null);
            }
          }
        } catch (err) {
          // If detect fails intermittently, keep last points for a grace window.
          missCountRef.current += 1;
          const lastSeen = lastFaceSeenAtRef.current || 0;
          const withinGrace = lastSeen > 0 && (now - lastSeen) < Number(noFaceGraceMs ?? 450);
          const missesNeeded = Math.max(1, Number(noFaceMissesToClear ?? 6));

          // Lightweight debug log (at most 1/sec)
          if (now - lastLogAtRef.current > 1000) {
            lastLogAtRef.current = now;
            // eslint-disable-next-line no-console
            console.warn('[useFaceOverlay] detectForVideo failed:', (err as any)?.message || err);
          }

          if (!withinGrace && missCountRef.current >= missesNeeded) {
            setHasFaceSafe(false);
            lastRealPointsRef.current = null;
            lastBlendshapesRef.current = null;
            lastHudAnchorRef.current = null;
            callbacksRef.current.onPoints?.(null);
            callbacksRef.current.onBlendshapes?.(null);
            callbacksRef.current.onHudAnchor?.(null);
          }
        }
      }

      // --- Choose points to draw ---
      let pointsToDraw: FacePoint[] | null = null;
      if (faceLandmarkerError || !faceLandmarker) {
        pointsToDraw = detectPlaceholderLandmarksFromVideo(videoNow)?.points ?? null;
      } else {
        pointsToDraw = lastRealPointsRef.current;
      }

      if (pointsToDraw) {
        ctx.save();

        // Read theme-like CSS vars if present
        const styles = getComputedStyle(canvasNow);
        const primary =
          styles.getPropertyValue('--gui-primary')?.trim() ||
          styles.getPropertyValue('--color-primary')?.trim() ||
          'rgba(116, 202, 255, 1)';
        const secondary = styles.getPropertyValue('--gui-secondary')?.trim() || primary;

        const grad = ctx.createLinearGradient(0, 0, canvasNow.width, 0);
        grad.addColorStop(0, primary);
        grad.addColorStop(1, secondary);

        ctx.globalAlpha = 0.95;
        ctx.strokeStyle = grad;
        ctx.fillStyle = 'transparent';
        ctx.lineWidth = 1.75;
        ctx.shadowBlur = 10;
        ctx.shadowColor = primary;

        const mapPoint = (pt: FacePoint) => {
          let vx = pt.x * vw;
          const vy = pt.y * vh;
          if (isMirrored) vx = (1 - pt.x) * vw;
          return {
            px: offsetX + vx * scale,
            py: offsetY + vy * scale,
          };
        };

        const hasRealMesh = pointsToDraw.length > 200;
        const connectionsEnabled = showMeshConnections !== undefined ? showMeshConnections : hasRealMesh;

        if (hasRealMesh && connectionsEnabled) {
          ctx.save();
          ctx.globalAlpha = 0.35;
          ctx.shadowBlur = 0;
          ctx.lineWidth = 1.25;

          ctx.beginPath();
          for (const [a, b] of MESH_CONNECTIONS) {
            const pa = pointsToDraw[a];
            const pb = pointsToDraw[b];
            if (!pa || !pb) continue;
            const A = mapPoint(pa);
            const B = mapPoint(pb);
            ctx.moveTo(A.px, A.py);
            ctx.lineTo(B.px, B.py);
          }
          ctx.stroke();
          ctx.restore();
        }

        const step = hasRealMesh ? Math.max(1, meshStep || 1) : 1;
        const r = hasRealMesh ? 2.25 : 4;

        for (let i = 0; i < pointsToDraw.length; i += step) {
          const { px, py } = mapPoint(pointsToDraw[i]);
          ctx.beginPath();
          ctx.arc(px, py, r, 0, 2 * Math.PI);
          ctx.stroke();
        }

        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelled = true;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setHasFaceSafe(false);
      lastFaceSeenAtRef.current = 0;
      missCountRef.current = 0;
      lastLogAtRef.current = 0;
      lastRealPointsRef.current = null;
      lastBlendshapesRef.current = null;
      lastHudAnchorRef.current = null;
      callbacksRef.current.onPoints?.(null);
      callbacksRef.current.onBlendshapes?.(null);
      callbacksRef.current.onHudAnchor?.(null);
    };
  }, [
    enabled,
    canvasRef,
    getVideoEl,
    faceLandmarker,
    faceLandmarkerLoading,
    faceLandmarkerError,
    variant,
    mirrorPreview,
    showMeshConnections,
    meshStep,
    detectThrottleMs,
    noFaceMissesToClear,
    noFaceGraceMs,
    setHasFaceSafe,
  ]);

  return {
    hasFace,
    lastPoints: lastRealPointsRef.current,
    lastBlendshapes: lastBlendshapesRef.current,
    hudAnchor: lastHudAnchorRef.current,
  };
}

export default useFaceOverlay;
