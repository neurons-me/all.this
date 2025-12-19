import * as React from 'react';

export type FaceTemplate = number[];

export type Blendshape = { categoryName: string; score: number };
export type Point2D = { x: number; y: number };

export type UseFaceTemplateBurstOptions = {
  /** Whether the burst sampler should run. */
  enabled: boolean;
  /** Whether a face is currently detected. If false, the sampler resets. */
  hasFace: boolean;
  /** Ref to the latest MediaPipe points (normalized 0..1, 468 entries when real). */
  pointsRef: React.MutableRefObject<Point2D[] | null>;
  /** Optional ref to blendshapes (if available). */
  blendshapesRef?: React.MutableRefObject<Blendshape[] | null>;
  /** If true, include a stable blendshape score vector appended to the template. */
  includeBlendshapes?: boolean;
  /** How many templates to collect before producing a stable one. Default: 15. */
  burstSize?: number;
  /** Interval for sampling frames into the burst (ms). Default: 60. */
  intervalMs?: number;
  /** Called when a new stable template is produced (or null on reset). */
  onTemplate?: (tpl: FaceTemplate | null) => void;
};

export type UseFaceTemplateBurstResult = {
  stableTemplate: FaceTemplate | null;
  /** Clears burst + stable template. */
  reset: () => void;
};

// MediaPipe mesh template indices (denser but still stable): cover eyes, brows, nose, mouth, cheeks, jaw, forehead.
const TEMPLATE_INDICES = [
  // eyes / eye corners
  33, 133, 160, 159, 158, 144,
  263, 362, 387, 386, 385, 373,
  // brows
  70, 63, 105, 66, 107,
  336, 296, 334, 293, 300,
  // nose
  1, 2, 98, 327, 5, 4,
  // mouth / lips
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291,
  // cheeks
  234, 93, 132, 58,
  454, 323, 361, 288,
  // jaw / chin
  152, 148, 176, 149, 150, 136,
  // forehead / face oval anchors
  10, 109, 67, 338,
  // misc stabilizers
  199,
];

function extractFaceTemplate(
  points: Point2D[],
  blendshapes?: Blendshape[],
  includeBlendshapes?: boolean
): FaceTemplate | null {
  if (!points || TEMPLATE_INDICES.some((idx) => !points[idx])) return null;

  // Center at nose tip (index 1)
  const nose = points[1];
  // Inter-ocular distance: 33 (left eye outer) and 263 (right eye outer)
  const p33 = points[33];
  const p263 = points[263];
  const iod = Math.sqrt((p33.x - p263.x) ** 2 + (p33.y - p263.y) ** 2);
  if (!iod || iod < 1e-6) return null;

  const arr: number[] = [];
  for (const idx of TEMPLATE_INDICES) {
    const pt = points[idx];
    arr.push((pt.x - nose.x) / iod, (pt.y - nose.y) / iod);
  }

  if (includeBlendshapes && blendshapes && blendshapes.length) {
    const sorted = [...blendshapes]
      .filter((b) => b && typeof b.categoryName === 'string')
      .sort((a, b) => a.categoryName.localeCompare(b.categoryName));

    for (const b of sorted) {
      const s = Math.max(0, Math.min(1, Number(b.score ?? 0)));
      arr.push(s);
    }
  }

  return arr;
}

function medianTemplate(templates: FaceTemplate[]): FaceTemplate | null {
  if (!templates.length) return null;

  const D = templates[0].length;
  for (let i = 1; i < templates.length; i++) {
    if (templates[i].length !== D) return null; // avoid mixed dims (e.g. blendshape list changed)
  }

  const out: number[] = [];
  for (let d = 0; d < D; d++) {
    const vals = templates.map((tpl) => tpl[d]).sort((a, b) => a - b);
    const mid = Math.floor(vals.length / 2);
    out.push(vals.length % 2 === 0 ? (vals[mid - 1] + vals[mid]) / 2 : vals[mid]);
  }
  return out;
}

/**
 * useFaceTemplateBurst
 *
 * Collects a short burst of templates from live landmarks and produces a stable template
 * via per-dimension median. Designed to be fed by refs that are updated by the overlay loop.
 */
export function useFaceTemplateBurst(options: UseFaceTemplateBurstOptions): UseFaceTemplateBurstResult {
  const {
    enabled,
    hasFace,
    pointsRef,
    blendshapesRef,
    includeBlendshapes,
    burstSize = 15,
    intervalMs = 60,
    onTemplate,
  } = options;

  const burstRef = React.useRef<FaceTemplate[]>([]);
  const [stableTemplate, setStableTemplate] = React.useState<FaceTemplate | null>(null);

  const reset = React.useCallback(() => {
    burstRef.current = [];
    setStableTemplate(null);
    onTemplate?.(null);
  }, [onTemplate]);

  // Reset when disabled or face disappears.
  React.useEffect(() => {
    if (!enabled || !hasFace) {
      burstRef.current = [];
      setStableTemplate(null);
      onTemplate?.(null);
    }
  }, [enabled, hasFace, onTemplate]);

  React.useEffect(() => {
    if (!enabled) return;
    if (!hasFace) return;

    const handle = window.setInterval(() => {
      const pts = pointsRef.current;
      if (!pts || !pts.length) return;

      const blend = blendshapesRef?.current ?? undefined;
      const tpl = extractFaceTemplate(pts, blend, includeBlendshapes);
      if (!tpl) return;

      burstRef.current.push(tpl);

      if (burstRef.current.length > burstSize) {
        burstRef.current.splice(0, burstRef.current.length - burstSize);
      }

      if (burstRef.current.length === burstSize) {
        const stable = medianTemplate(burstRef.current);
        if (stable) {
          burstRef.current = [];
          setStableTemplate(stable);
          onTemplate?.(stable);
        }
      }
    }, Math.max(16, intervalMs));

    return () => window.clearInterval(handle);
  }, [enabled, hasFace, pointsRef, blendshapesRef, includeBlendshapes, burstSize, intervalMs, onTemplate]);

  return { stableTemplate, reset };
}

export default useFaceTemplateBurst;