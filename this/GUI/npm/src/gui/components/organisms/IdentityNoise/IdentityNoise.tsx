// IdentityNoise.tsx — Floating .me badge wrapper
// Renders the draggable animated .me orb and toggles the Triad badge ("Identity Noise")
import { useEffect, useMemo, useRef, useState } from "react";
import { Box } from "@mui/material";
import { GlobalStyles } from "@mui/system";
import type { Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material";
import Triad from "./Triad/Triad";
export default function IdentityNoise() {
  const [open, setOpen] = useState(false);
  const status = { active: true, error: false };
  const theme = useTheme() as any;
  const { top = 0, bottom = 0, left = 0, right = 0 } = theme.layout?.insets || {};
  // Drag state
  const dockPos = useRef({
    x: (window.innerWidth - left - right) / 2,
    y: (window.innerHeight - top - bottom) / 2,
  });

  const [pos, setPos] = useState(dockPos.current);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const clickTimeout = useRef<number | null>(null);
  const dragMoved = useRef(false);

  /** ✅ Drag */
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setOffset({ x: e.clientX - pos.x, y: e.clientY - pos.y });
    dragMoved.current = false;
    clickTimeout.current = Date.now();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging) return;
    if (Math.abs(e.clientX - pos.x) > 3 || Math.abs(e.clientY - pos.y) > 3) {
      dragMoved.current = true;
    }

    const rawX = e.clientX - offset.x;
    const rawY = e.clientY - offset.y;

    const clampedX = Math.min(window.innerWidth - right - 120, Math.max(left, rawX));
    const clampedY = Math.min(window.innerHeight - bottom - 120, Math.max(top, rawY));

    setPos({ x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => {
    setDragging(false);
    dragMoved.current = false;
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  useEffect(() => {
    const handleResize = () => {
      if (!dragging) {
        dockPos.current = { x: window.innerWidth - 80, y: window.innerHeight - 80 };
        setPos(dockPos.current);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dragging]);

  // Badge placement relative to orb
  const badgeSide = pos.x > window.innerWidth / 2 ? "left" : "right";
  const badgeStyle =
    badgeSide === "left"
      ? ({ right: 120 + 10 } as const)
      : ({ left: 120 + 10 } as const);

  // Gentle "string" connector between orb and badge (bezier-ish + subtle wobble)
  const connectorKey = `${badgeSide}:${open ? "open" : "closed"}`;
  const connector = useMemo(() => {
    const radius = 30; // roughly the orb radius (60/2)

    // Anchor points are in the 80x80 relative box space.
    // orb center at (40,40). string attaches to left/right edge depending on badgeSide.
    const start = {
      // Exit slightly above center so it feels like it comes from the orb edge
      x: badgeSide === "left" ? 40 - radius + 1 : 40 + radius - 1,
      y: 40 - 11,
    };

    // Badge is positioned at: top: -10; left/right: 130; width: 332
    // So the edge nearest the orb is at x = 130 for right-side, or x = -? for left-side.
    // We draw the SVG in the same 80x80 box but with overflow visible.
    // We'll set end point near the badge edge, slightly inset.
    const end = {
      // Attach closer to the badge border, a bit higher than center
      x: badgeSide === "left" ? -82 : 162,
      y: 18,
    };

    const dx = end.x - start.x;
    const dy = end.y - start.y;

    // Control points: create a gentle sag + curve. Direction changes with side.
    const c1 = {
      x: start.x + dx * 0.35,
      y: start.y + dy * 0.15 + 10,
    };

    const c2 = {
      x: start.x + dx * 0.7,
      y: start.y + dy * 0.75 + 6,
    };

    const d = `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;

    return { d, start, end };
  }, [badgeSide]);

  return (
    <>
      <GlobalStyles
        styles={{
          "@keyframes float": {
            "0%,100%": { transform: "translateY(0) scale(1)", borderRadius: "50%" },
            "25%": {
              transform: "translateY(-6px) scale(1.05)",
              borderRadius: "55% 45% 60% 40% / 60% 55% 45% 40%",
            },
            "50%": {
              transform: "translateY(-8px) scale(1.1)",
              borderRadius: "50% 60% 40% 55% / 55% 40% 60% 45%",
            },
            "75%": {
              transform: "translateY(-6px) scale(1.05)",
              borderRadius: "45% 55% 40% 60% / 40% 60% 55% 50%",
            },
          },
          "@keyframes glow": {
            "0%,100%": {
              opacity: 0.3,
              boxShadow:
                "0 0 4px rgba(255,255,255,0.2), 0 0 8px rgba(173,216,230,0.1)",
            },
            "50%": {
              opacity: 0.5,
              boxShadow:
                "0 0 6px rgba(255,255,255,0.3), 0 0 10px rgba(173,216,230,0.15)",
            },
          },
          "@keyframes blobMove": {
            "0%,100%": {
              top: "15%",
              left: "20%",
              width: "65%",
              height: "65%",
              borderRadius: "60% 40% 55% 45% / 50% 60% 40% 50%",
              filter: "blur(14px)",
            },
            "33%": {
              top: "10%",
              left: "25%",
              width: "70%",
              height: "70%",
              borderRadius: "55% 60% 40% 45% / 45% 50% 60% 55%",
              filter: "blur(18px)",
            },
            "66%": {
              top: "18%",
              left: "15%",
              width: "60%",
              height: "60%",
              borderRadius: "50% 55% 45% 60% / 60% 50% 55% 40%",
              filter: "blur(12px)",
            },
          },
          "@keyframes stringWobble": {
            "0%,100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(0.6px)" },
          },
        }}
      />

      <Box
        sx={{
          position: "fixed",
          left: pos.x - 20,
          top: pos.y - 20,
          width: 120,
          height: 120,
          borderRadius: "12px",
          border: open ? "2px solid rgba(255,255,255,0.25)" : "2px solid transparent",
          background: open ? "rgba(0,0,0,0.1)" : "transparent",
          backdropFilter: open ? "blur(12px)" : "none",
          boxShadow: open ? "0 0 18px rgba(0,0,0,0.25)" : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 1400,
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: 80,
            height: 80,
            pointerEvents: "none",
            overflow: "visible",
          }}
        >
          {/* Gentle connector string (only when open) */}
          {open ? (
            <Box
              key={connectorKey}
              sx={{
                position: "absolute",
                inset: 0,
                overflow: "visible",
                pointerEvents: "none",
                opacity: 0.55,
                animation: "stringWobble 4.2s ease-in-out infinite",
                filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.18))",
              }}
            >
              <svg
                width="80"
                height="80"
                viewBox="0 0 80 80"
                style={{ overflow: "visible" }}
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="meStringAbs" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity="0.0" />
                    <stop offset="45%" stopColor={theme.palette.primary.main} stopOpacity="0.18" />
                    <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* thin abstract stroke */}
                <path
                  d={connector.d}
                  fill="none"
                  stroke="url(#meStringAbs)"
                  strokeWidth="1.15"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.85"
                />

                {/* little endpoint dot near badge edge */}
                <circle
                  cx={connector.end.x}
                  cy={connector.end.y}
                  r="1.1"
                  fill={theme.palette.primary.main}
                  opacity="0.45"
                />
              </svg>
            </Box>
          ) : null}

          {/* Badge popover */}
          {open ? (
            <Box
              sx={{
                position: "absolute",
                top: -10,
                ...badgeStyle,
                width: 332,
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.18)",
                background:
                  theme.palette?.mode === "light"
                    ? "rgba(255,255,255,0.55)"
                    : "rgba(10,14,18,0.55)",
                backdropFilter: "blur(14px) saturate(160%)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
                overflow: "hidden",
                pointerEvents: "auto",
              }}
            >
              <Box
                sx={{
                  px: 1.25,
                  py: 0.9,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  borderBottom: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <Box
                  sx={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                    color: theme.palette?.mode === "light" ? "#005a7a" : "#baf3ff",
                    userSelect: "none",
                  }}
                >
                  Identity Noise
                </Box>

                <Box
                  onClick={() => setOpen(false)}
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: theme.palette?.mode === "light" ? "#005a7a" : "#baf3ff",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    userSelect: "none",
                    "&:hover": {
                      background: "rgba(255,255,255,0.14)",
                    },
                  }}
                  aria-label="Close"
                >
                  ×
                </Box>
              </Box>

              <Box sx={{ p: 1.0 }}>
                <Triad />
              </Box>
            </Box>
          ) : null}

          <Box
            onClick={() => {
              if (clickTimeout.current !== null) {
                const elapsed = Date.now() - clickTimeout.current;
                if (!dragging && !dragMoved.current && elapsed < 300) {
                  setOpen((prev) => !prev);
                }
              }
            }}
            onMouseDown={handleMouseDown}
            sx={(t: Theme) => ({
              position: "absolute",
              top: 10,
              left: 10,
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: t.palette.mode === "light" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.1)",
              boxShadow:
                !status.active || status.error
                  ? "0 0 0 3px #ff4d4d, 0 0 20px 6px rgba(255,0,0,0.6)"
                  : "0 0 0 3px #29bfff, 0 0 22px 6px rgba(0,200,255,0.6)",
              border: !status.active || status.error ? "2.5px solid #ff1a1a" : "2.5px solid #9ff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              color: t.palette.mode === "light" ? "#006699" : "#baf3ff",
              cursor: "pointer",
              userSelect: "none",
              animation: "float 6s ease-in-out infinite, glow 4.5s ease-in-out infinite",
              backdropFilter: "blur(10px) saturate(160%)",
              pointerEvents: "auto",
              "&::before": {
                content: '""',
                position: "absolute",
                top: "15%",
                left: "20%",
                width: "65%",
                height: "65%",
                background:
                  t.palette.mode === "light"
                    ? "radial-gradient(circle at 50% 50%, rgba(0,102,153,0.4) 0%, rgba(0,68,102,0) 70%)"
                    : "radial-gradient(circle at 50% 50%, rgba(120,240,255,0.3) 0%, rgba(173,216,230,0) 70%)",
                filter: "blur(7px)",
                borderRadius: "60% 40% 55% 45% / 50% 60% 40% 50%",
                animation: "blobMove 8s ease-in-out infinite",
                pointerEvents: "none",
                mixBlendMode: "screen",
              },
              "&:hover": {
                transform: "scale(1.08)",
              },
            })}
          >
            ⊙
          </Box>
        </Box>
      </Box>
    </>
  );
}