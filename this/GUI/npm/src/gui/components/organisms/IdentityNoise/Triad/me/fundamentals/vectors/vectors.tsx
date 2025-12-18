import React from 'react';
import { Box, Slider } from '@mui/material';
interface VectorNode {
  id: string;
  children?: VectorNode[];
  weight?: number;
  frequency?: number;
  lastUsed?: number;
}

interface VectorsOrbitProps {
  vectors: VectorNode[];
  visible?: boolean;
  radius?: number;     // distance from parent
  level?: number;      // recursion depth
  containerSize?: number;
  showControls?: boolean;
  fitToContainer?: boolean;
  squareOrbit?: {
    size: number;
    offsetX: number;
    offsetY: number;
    spiralFactor?: number;
  };
}

const pulse = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.9; }
    50% { transform: scale(1.15); opacity: 1; }
  }
`;

const styles = `
  ${pulse}
`;

const VectorsOrbit: React.FC<VectorsOrbitProps> = ({
  vectors,
  visible = true,
  radius = 70,
  level = 0,
  containerSize = 140,
  showControls = true,
  fitToContainer = false,
  squareOrbit,
}) => {
  const [timeScale, setTimeScale] = React.useState(1);     // vertical control
  const [weightScale, setWeightScale] = React.useState(1); // horizontal control
  const [viewMode, setViewMode] = React.useState<"icon" | "text">("icon");

  if (!visible || vectors.length === 0) return null;

  const enriched = vectors
    .map(v => {
      const last = v.lastUsed ?? Date.now();
      const freq = v.frequency ?? 1;

      const secondsSince = (Date.now() - last) / 1000;

      // MASS = frequency density
      const mass = freq / (1 + secondsSince);

      // RECENCY for activation boost
      const recency = 1 / (1 + secondsSince);

      // WEIGHT combines both
      const weight = mass + 2 * recency;

      return { ...v, mass, weight };
    })
    .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));

  return (
    <>
      <style>{styles}</style>

      {/* Controls */}
      {showControls && (
        <Box sx={{ position: "absolute", top: 10, left: 10, zIndex: 999, width: 'calc(100% - 20px)' }}>
          <button
            style={{
              marginBottom: 6,
              padding: "4px 10px",
              background: "rgba(0,150,255,0.2)",
              border: "1px solid rgba(0,150,255,0.4)",
              borderRadius: 6,
              cursor: "pointer",
              color: "white",
              fontSize: 12,
              display: "block",
              width: "100%"
            }}
            onClick={() =>
              setViewMode(viewMode === "icon" ? "text" : "icon")
            }
          >
            {viewMode === "icon" ? "TEXT VIEW" : "ICON VIEW"}
          </button>
          {/* Horizontal weight slider */}
          <Box sx={{ width: "100%", mb: 2 }}>
            <Slider
              value={weightScale}
              onChange={(e, v) => setWeightScale(v as number)}
              min={0.2}
              max={3}
              step={0.1}
              valueLabelDisplay="auto"
            />
          </Box>

          {/* Vertical time slider */}
          <Box
            sx={{
              height: 120,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Slider
              orientation="vertical"
              value={timeScale}
              onChange={(e, v) => setTimeScale(v as number)}
              min={0.2}
              max={3}
              step={0.1}
              valueLabelDisplay="auto"
            />
          </Box>
        </Box>
      )}

      <Box sx={{ position: "absolute", top: 0, left: 0, width: containerSize, height: containerSize }}>
        {enriched.map((vector, i) => {
          const bubbleOffset = viewMode === "icon"
            ? (fitToContainer ? 9 : 13)
            : (fitToContainer ? 16 : 20);
          const bubbleRadius = viewMode === "icon" ? 13 : 16;

          let centerX = containerSize / 2;
          let centerY = containerSize / 2;

          if (squareOrbit) {
            const { size, offsetX, offsetY, spiralFactor = 0.25 } = squareOrbit;
            const expandedSize = size * 1.6;
            const perimeter = expandedSize * 4;
            const step = perimeter / Math.max(1, enriched.length);
            const distance = (i * step) % perimeter;

            let px = 0;
            let py = 0;
            if (distance < expandedSize) {
              px = distance;
              py = 0;
            } else if (distance < expandedSize * 2) {
              px = expandedSize;
              py = distance - expandedSize;
            } else if (distance < expandedSize * 3) {
              px = expandedSize - (distance - expandedSize * 2);
              py = expandedSize;
            } else {
              px = 0;
              py = expandedSize - (distance - expandedSize * 3);
            }

            const baseX = offsetX + px;
            const baseY = offsetY + py;
            const centerSquareX = offsetX + expandedSize / 2;
            const centerSquareY = offsetY + expandedSize / 2;
            const dx = baseX - centerSquareX;
            const dy = baseY - centerSquareY;
            const inward =
              Math.min(0.85, ((i + 1) / Math.max(1, enriched.length)) * spiralFactor);
            centerX = baseX - dx * inward;
            centerY = baseY - dy * inward;
          } else {
            const maxRadius = containerSize / 2 - bubbleOffset;
            const baseRadius = Math.min(radius + 8 * (vector.weight ?? 1), maxRadius);
            const orbitRadius = fitToContainer ? maxRadius : baseRadius;
            const theta = i * 0.75;
            const x = Math.cos(theta) * orbitRadius * weightScale;
            const y = Math.sin(theta) * orbitRadius * timeScale;
            centerX = containerSize / 2 + x;
            centerY = containerSize / 2 + y;
          }

          return (
            <React.Fragment key={vector.id}>
              {viewMode === "icon" ? (
                <Box
                  sx={{
                    position: "absolute",
                    top: centerY - bubbleRadius,
                    left: centerX - bubbleRadius,
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    border: "1px solid rgba(0,150,255,0.4)",
                    background: "rgba(0,150,255,0.1)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    color: "#9ff6ff",
                    cursor: "pointer",
                    animation: "pulse 2.5s ease-in-out infinite",
                    transformOrigin: "center"
                  }}
                >
                  {vector.id}
                </Box>
              ) : (
                <Box
                  sx={{
                    position: "absolute",
                    top: centerY - bubbleRadius,
                    left: centerX - bubbleRadius,
                    padding: "6px 10px",
                    background: "rgba(0,50,90,0.6)",
                    border: "1px solid rgba(0,150,255,0.4)",
                    borderRadius: "6px",
                    fontSize: "11px",
                    color: "#bffaff",
                    maxWidth: 140
                  }}
                >
                  <div><b>{vector.id}</b></div>
                  <div>mass: {vector.mass?.toFixed(3)}</div>
                  <div>weight: {vector.weight?.toFixed(3)}</div>
                  <div>freq: {vector.frequency ?? 1}</div>
                </Box>
              )}

              {vector.children && vector.children.length > 0 && (
                <VectorsOrbit
                  vectors={vector.children}
                  visible={true}
                  radius={radius * 0.9}
                  level={level + 1}
                  containerSize={containerSize}
                />
              )}
            </React.Fragment>
          );
        })}
      </Box>
    </>
  );
};

export default VectorsOrbit;
