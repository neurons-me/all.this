import React, { useId, useMemo } from "react";
import qrcodegen from "qrcode-generator";
export type QREmbedMode = "none" | "negative-space" | "positive-overlay";
export type QRProps = {
  /** The string to encode in the QR (e.g. identityRoot / cleak) */
  value: string;
  /** Overall rendered size in px */
  size?: number;
  /** Background color (can use CSS variables, e.g. var(--qr-bg)) */
  bg?: string;
  /** Foreground color (can use CSS variables, e.g. var(--qr-fg)) */
  fg?: string;
  /** Rounded corner radius (px) for modules (0 = square) */
  moduleRadius?: number;
  /** Quiet zone in modules */
  quietZone?: number;
  /** Error correction level */
  ecc?: "L" | "M" | "Q" | "H";
  /** Optional ASCII art label to show above the QR (not inside the QR) */
  asciiHeader?: string;
  /** Optional small caption to show under the QR */
  caption?: string;
  /**
   * Embed ASCII “logo” by carving out negative space in the center.
   * - `none`: standard QR
   * - `negative-space`: remove modules in the center region (safe with ECC=H)
   * - `positive-overlay`: clear the center region, then draw modules from the ASCII art on top
   */
  embedMode?: QREmbedMode;
  /**
   * Size of the embedded region as a fraction of QR modules. Typical safe range: 0.18–0.28.
   * Used only when embedMode !== 'none'.
   */
  embedScale?: number;
  /**
   * The ASCII art to embed (center carve or overlay). Keep it compact.
   * NOTE: for scan safety, we carve empty space in negative-space mode,
   * and draw modules in positive-overlay mode.
   */
  embedAscii?: string;
  /**
   * Optional bitmap to embed instead of ASCII parsing.
   * Provide rows of "0"/"1" (all rows same length). "1" = draw module.
   */
  embedBitmap?: string[];
  /** Additional className */
  className?: string;
  /** Inline style */
  style?: React.CSSProperties;
  /** Debug: render the parsed/trimmed ASCII bitmap above the QR */
  showEmbeddedAsciiPreview?: boolean;
};
function parseStringBitmap(rows: string[]): boolean[][] {
  const cleaned = (rows ?? []).map((r) => (r ?? "").trimEnd());
  while (cleaned.length && cleaned[0].trim().length === 0) cleaned.shift();
  while (cleaned.length && cleaned[cleaned.length - 1].trim().length === 0) cleaned.pop();
  if (!cleaned.length) return [];

  const w = Math.max(0, ...cleaned.map((r) => r.length));
  return cleaned.map((r) => {
    const line = r.padEnd(w, "0");
    return [...line].map((ch) => ch === "1");
  });
}

type ModuleMatrix = boolean[][];

function buildQRMatrix(value: string, ecc: "L" | "M" | "Q" | "H"): ModuleMatrix {
  // qrcode-generator expects typeNumber 0 for auto
  const qr = (qrcodegen as any)(0, ecc);
  qr.addData(value);
  qr.make();
  const count: number = qr.getModuleCount();
  const m: boolean[][] = [];
  for (let y = 0; y < count; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < count; x++) {
      row.push(qr.isDark(y, x));
    }
    m.push(row);
  }
  return m;
}

function isInFinderOrTiming(m: ModuleMatrix, x: number, y: number): boolean {
  const n = m.length;

  // Finder patterns are 7x7 in three corners (+ separators around them)
  const inTopLeft = x <= 8 && y <= 8;
  const inTopRight = x >= n - 9 && y <= 8;
  const inBottomLeft = x <= 8 && y >= n - 9;
  if (inTopLeft || inTopRight || inBottomLeft) return true;

  // Timing patterns are along row 6 and col 6 (0-indexed)
  if (x === 6 || y === 6) return true;

  // Format information areas near finders
  if (y === 8 && (x <= 8 || x >= n - 8)) return true;
  if (x === 8 && (y <= 8 || y >= n - 8)) return true;

  return false;
}

function parseAsciiToBitmap(ascii: string): boolean[][] {
  const lines = ascii
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.replace(/\t/g, "    "))
    // keep empty lines inside art, but trim purely-leading/trailing blank lines
    ;

  // Trim leading/trailing fully-blank lines
  while (lines.length && lines[0].trimEnd().length === 0) lines.shift();
  while (lines.length && lines[lines.length - 1].trimEnd().length === 0) lines.pop();

  if (!lines.length) return [];

  const onChars = new Set([
    "█",
    "▄",
    "▀",
    "▌",
    "▐",
    "▖",
    "▗",
    "▘",
    "▝",
    "▚",
    "▛",
    "▜",
    "▙",
    "▟",
    "■",
    "▓",
    "▒",
    "░",
    "#",
    "@",
    "*",
    "+",
  ]);

  const maxW = Math.max(0, ...lines.map((l) => l.length));
  return lines.map((line) => {
    const padded = line.padEnd(maxW, " ");
    return [...padded].map((ch) => onChars.has(ch));
  });
}

function bitmapToDebugAscii(bitmap: boolean[][]): string {
  if (!bitmap.length) return "";
  return bitmap
    .map((row) => row.map((on) => (on ? "█" : " ")).join(""))
    .join("\n");
}

function getCenteredEmbedRegion(
  matrixSize: number,
  ascii: string | undefined,
  embedBitmap: string[] | undefined,
  embedScale: number
): {
  startX: number;
  startY: number;
  regionW: number;
  regionH: number;
  scaled: boolean[][];
} | null {
  const bmp = embedBitmap?.length
    ? parseStringBitmap(embedBitmap)
    : ascii
      ? parseAsciiToBitmap(ascii)
      : [];
  if (bmp.length === 0) return null;
  const bmpH = bmp.length;
  const bmpW = bmp[0]?.length ?? 0;
  if (!bmpW) return null;

  // Trim to ink bounding box
  let minX = bmpW,
    minY = bmpH,
    maxX = -1,
    maxY = -1;
  for (let y = 0; y < bmpH; y++) {
    for (let x = 0; x < bmpW; x++) {
      if (!bmp[y]?.[x]) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0 || maxY < 0) return null;

  const trimmed = bmp
    .slice(minY, maxY + 1)
    .map((row) => row.slice(minX, maxX + 1));

  const tH = trimmed.length;
  const tW = trimmed[0]?.length ?? 0;
  if (!tW) return null;

  const region = Math.max(1, Math.floor(matrixSize * embedScale));

  // Make the embed region rectangular to better fit the ASCII art.
  // If the art is wider than tall, give it extra width (up to ~25% more).
  const aspect = tW / tH;
  const maxBoost = 1.6;

  let regionW = region;
  let regionH = region;

  if (aspect > 1) {
    regionW = Math.min(matrixSize, Math.max(1, Math.round(region * Math.min(maxBoost, aspect))));
    regionH = Math.max(1, Math.round(region / Math.min(maxBoost, aspect)));
  } else if (aspect < 1) {
    regionH = Math.min(matrixSize, Math.max(1, Math.round(region * Math.min(maxBoost, 1 / aspect))));
    regionW = Math.max(1, Math.round(region / Math.min(maxBoost, 1 / aspect)));
  }

  const startX = Math.floor((matrixSize - regionW) / 2);
  const startY = Math.floor((matrixSize - regionH) / 2);

  // Scale into region while preserving aspect ratio (letterbox inside region)
  const sx = regionW / tW;
  const sy = regionH / tH;
  const s = Math.min(sx, sy);

  // REMOVED vScale vertical fudge for bitmap
  const drawW = Math.max(1, Math.floor(tW * s));
  const drawH = Math.max(1, Math.floor(tH * s));

  // Center the drawn area inside the region
  const offX = Math.floor((regionW - drawW) / 2);
  const offY = Math.floor((regionH - drawH) / 2);

  const scaled: boolean[][] = Array.from({ length: regionH }, () =>
    Array.from({ length: regionW }, () => false)
  );

  const invS = 1 / s;
  for (let ry = 0; ry < drawH; ry++) {
    for (let rx = 0; rx < drawW; rx++) {
      const bx = Math.min(tW - 1, Math.floor(rx * invS));
      const by = Math.min(tH - 1, Math.floor(ry * invS));
      const x = offX + rx;
      const y = offY + ry;
      if (x < 0 || y < 0 || x >= regionW || y >= regionH) continue;
      scaled[y][x] = trimmed[by]?.[bx] ?? false;
    }
  }
  return { startX, startY, regionW, regionH, scaled };
}

function clearCenteredRegion(
  matrix: ModuleMatrix,
  ascii: string | undefined,
  embedBitmap: string[] | undefined,
  embedScale: number,
  padX: number = 1,
  padY: number = 1
): ModuleMatrix {
  const n = matrix.length;
  const region = getCenteredEmbedRegion(n, ascii, embedBitmap, embedScale);
  if (!region) return matrix;

  const { startX, startY, regionW, regionH } = region;
  const out: ModuleMatrix = matrix.map((row) => row.slice());

// Anisotropic padding around the embed region
const x0 = Math.max(0, startX - padX);
const y0 = Math.max(0, startY - padY);
const x1 = Math.min(n - 1, startX + regionW - 1 + padX);
const y1 = Math.min(n - 1, startY + regionH - 1 + padY);

// Rounded-rect clearing for a nicer merge with the QR noise
const w = x1 - x0 + 1;
const h = y1 - y0 + 1;
const radius = Math.max(2, Math.floor(Math.min(w, h) * 0.18)); // corner roundness
const fade = 2; // thickness of the transition band
// Lower-left corner shaping: soften the cut and close the gap more in that corner
const llCornerSpan = Math.max(3, Math.floor(Math.min(w, h) * 0.55));

const distToRoundedRect = (x: number, y: number) => {
  const cx = x0 + w / 2;
  const cy = y0 + h / 2;
  const qx = Math.abs(x - cx) - (w / 2 - radius);
  const qy = Math.abs(y - cy) - (h / 2 - radius);
  const ax = Math.max(qx, 0);
  const ay = Math.max(qy, 0);
  const outside = Math.hypot(ax, ay);
  const inside = Math.min(Math.max(qx, qy), 0);
  return outside + inside - radius; // <= 0 inside
};

for (let y = y0 - fade; y <= y1 + fade; y++) {
  for (let x = x0 - fade; x <= x1 + fade; x++) {
    if (x < 0 || y < 0 || x >= n || y >= n) continue;
    if (isInFinderOrTiming(out, x, y)) continue;

    const d = distToRoundedRect(x, y);
    if (d <= 0) {
      // Fully clear inside, but keep a tiny amount of noise near the lower-left corner
      const llDist0 = Math.hypot(x - x0, y - y1);
      const llW0 = Math.max(0, Math.min(1, 1 - llDist0 / llCornerSpan));
      const seed0 = ((x * 73856093) ^ (y * 19349663)) >>> 0;
      const rnd0 = (seed0 % 1024) / 1024;
      // Keep up to ~22% of modules near that corner (so it doesn't look like a sharp bite)
      if (!(llW0 > 0 && rnd0 < llW0 * 0.22)) out[y][x] = false;
    } else if (d <= fade) {
      // Transition band: probabilistic clearing for a softer edge (stable, no flicker)
      const t = 1 - d / fade; // 1 near edge, 0 far

      // Make the RIGHT side less empty: reduce clearing probability as we approach x1
      const edgeSpan = Math.max(1, Math.floor(w * 0.34)); // rightmost 35% of the cleared box
      const rightness = Math.max(0, Math.min(1, (x - (x1 - edgeSpan)) / edgeSpan)); // 0..1
      const edgeFactor = 1 - 0.55 * rightness; // 1.0 (left) -> 0.45 (right)

      // Stable hash noise for a less grid-like mix
      const seed = ((x * 73856093) ^ (y * 19349663)) >>> 0;
      const rnd = (seed % 1024) / 1024; // 0..1

      // Lower-left corner weight (1 near LL corner, 0 away)
      const llDist = Math.hypot(x - x0, y - y1);
      const llW = Math.max(0, Math.min(1, 1 - llDist / llCornerSpan));

      // In LL corner: clear less aggressively (fills more) and effectively widen fade
      const llT = Math.min(1, t + llW * 0.35);
      const strength = 0.55 - llW * 0.18;

      if (rnd < llT * strength * edgeFactor) out[y][x] = false;
    }
  }
}

  return out;
}

function carveCenterForAscii(
  matrix: ModuleMatrix,
  ascii: string | undefined,
  embedBitmap: string[] | undefined,
  embedScale: number
): ModuleMatrix {
  const n = matrix.length;
  const region = getCenteredEmbedRegion(n, ascii, embedBitmap, embedScale);
  if (!region) return matrix;

  // First, clear the entire center rectangle so QR noise doesn't bleed into the logo.
  // Padding gives the logo some breathing room and improves readability.
const cleared = clearCenteredRegion(matrix, ascii, embedBitmap, embedScale, 1, 1);
  const { startX, startY, regionW, regionH, scaled } = region;
  const out: ModuleMatrix = cleared.map((row) => row.slice());
  // Then, carve the logo shape inside that cleared area (negative-space effect).
  for (let ry = 0; ry < regionH; ry++) {
    for (let rx = 0; rx < regionW; rx++) {
      const on = scaled[ry]?.[rx] ?? false;
      const x = startX + rx;
      const y = startY + ry;
      if (x < 0 || y < 0 || x >= n || y >= n) continue;
      if (isInFinderOrTiming(out, x, y)) continue;
      if (on) out[y][x] = false;
    }
  }

  return out;
}

function buildAsciiOverlayPath(
  matrix: ModuleMatrix,
  ascii: string | undefined,
  embedBitmap: string[] | undefined,
  embedScale: number,
  quietZone: number,
  cell: number,
  moduleRadius: number
): string {
  const n = matrix.length;
  const region = getCenteredEmbedRegion(n, ascii, embedBitmap, embedScale);
  if (!region) return "";
  // NOTE: The QR matrix itself is carved elsewhere; this is just the overlay.
  // We keep the overlay constrained to the region, and the region is cleared with padding for readability.
  const { startX, startY, regionW, regionH, scaled } = region;

  const r = Math.max(0, moduleRadius);
  const parts: string[] = [];

  for (let ry = 0; ry < regionH; ry++) {
    for (let rx = 0; rx < regionW; rx++) {
      const on = scaled[ry]?.[rx] ?? false;
      if (!on) continue;
      const x = startX + rx;
      const y = startY + ry;
      if (x < 0 || y < 0 || x >= n || y >= n) continue;
      if (isInFinderOrTiming(matrix, x, y)) continue;

      const px = (x + quietZone) * cell;
      const py = (y + quietZone) * cell;
      parts.push(roundedRectPath(px, py, cell, cell, r));
    }
  }

  return parts.join(" ");
}

function roundedRectPath(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  if (rr <= 0) return `M${x} ${y}h${w}v${h}h-${w}Z`;
  return [
    `M${x + rr} ${y}`,
    `h${w - rr * 2}`,
    `a${rr} ${rr} 0 0 1 ${rr} ${rr}`,
    `v${h - rr * 2}`,
    `a${rr} ${rr} 0 0 1 -${rr} ${rr}`,
    `h-${w - rr * 2}`,
    `a${rr} ${rr} 0 0 1 -${rr} -${rr}`,
    `v-${h - rr * 2}`,
    `a${rr} ${rr} 0 0 1 ${rr} -${rr}`,
    `Z`,
  ].join(" ");
}

export default function QR({
  value,
  size = 160,
  bg = "var(--qr-bg, transparent)",
  fg = "var(--qr-fg, currentColor)",
  moduleRadius = 0,
  quietZone = 4,
  ecc = "H",
  asciiHeader,
  caption,
  embedMode = "none",
  embedScale = 0.22,
  embedAscii,
  embedBitmap,
  className,
  style,
  showEmbeddedAsciiPreview = false,
}: QRProps) {
  const clipId = useId();

  const matrix = useMemo(() => {
    const base = buildQRMatrix(value, ecc);
    if (embedMode === "negative-space" || embedMode === "positive-overlay") {
      if (embedBitmap?.length || embedAscii) {
        return carveCenterForAscii(base, embedAscii, embedBitmap, embedScale);
      }
    }
    return base;
  }, [value, ecc, embedMode, embedAscii, embedBitmap, embedScale]);

  const n = matrix.length;
  const totalModules = n + quietZone * 2;
  const cell = size / totalModules;
  const r = Math.max(0, moduleRadius);

  // Build a single path for performance
  const pathD = useMemo(() => {
    const parts: string[] = [];
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (!matrix[y][x]) continue;
        const px = (x + quietZone) * cell;
        const py = (y + quietZone) * cell;
        parts.push(roundedRectPath(px, py, cell, cell, r));
      }
    }
    return parts.join(" ");
  }, [matrix, n, quietZone, cell, r]);

const overlayD = useMemo(() => {
  if (!embedAscii && !(embedBitmap?.length)) return "";
  if (embedMode !== "positive-overlay" && embedMode !== "negative-space") return "";
  const base = buildQRMatrix(value, ecc);
  return buildAsciiOverlayPath(base, embedAscii, embedBitmap, embedScale, quietZone, cell, r);
}, [embedMode, embedAscii, embedBitmap, embedScale, value, ecc, quietZone, cell, r]);

  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        gap: 8,
        ...(style ?? {}),
        // Allow theme to drive QR colors via CSS variables
        ["--qr-bg" as any]: bg,
        ["--qr-fg" as any]: fg,
      }}
    >
      {asciiHeader ? (
        <pre
          style={{
            margin: 0,
            padding: 0,
            lineHeight: 1,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
            fontSize: 12,
            opacity: 0.9,
            userSelect: "none",
          }}
        >
          {asciiHeader}
        </pre>
      ) : null}

      {showEmbeddedAsciiPreview && (embedAscii || (embedBitmap?.length)) ? (() => {
        const reg = getCenteredEmbedRegion(matrix.length, embedAscii, embedBitmap, embedScale);
        if (!reg) return null;
        // show the trimmed ascii or bitmap (pre-scale)
        const trimmedBmp = embedBitmap?.length ? parseStringBitmap(embedBitmap) : parseAsciiToBitmap(embedAscii ?? "");
        const trimmedDebug = bitmapToDebugAscii(trimmedBmp);
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 11, opacity: 0.8, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" }}>
              embed region: {reg.regionW}×{reg.regionH} modules @ {Math.round(embedScale * 100)}%
            </div>
            <pre style={{ margin: 0, padding: 8, borderRadius: 8, background: "rgba(0,0,0,0.06)", lineHeight: 1, fontSize: 10, userSelect: "text", overflow: "auto", maxWidth: size }}>
              {trimmedDebug || "(empty bitmap)"}
            </pre>
          </div>
        );
      })() : null}

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="QR code"
        shapeRendering="crispEdges"
      >
        {/* background */}
        {bg !== "transparent" ? <rect x={0} y={0} width={size} height={size} fill={`var(--qr-bg, ${bg})`} /> : null}

        {/* clip to rounded outer rect if bg is transparent */}
        <defs>
          <clipPath id={clipId}>
            <rect x={0} y={0} width={size} height={size} rx={12} ry={12} />
          </clipPath>
        </defs>

        <g clipPath={`url(#${clipId})`}>
          <path d={pathD} fill={`var(--qr-fg, ${fg})`} />
          {overlayD ? <path d={overlayD} fill={`var(--qr-fg, ${fg})`} /> : null}
        </g>
      </svg>

      {caption ? (
        <div
          style={{
            fontSize: 11,
            lineHeight: "14px",
            opacity: 0.8,
            maxWidth: size,
            wordBreak: "break-all",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          }}
        >
          {caption}
        </div>
      ) : null}
    </div>
  );
}
