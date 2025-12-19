import React from "react";
import { Box, Typography, IconButton } from "@/gui/atoms";
import { useGuiTheme } from "@/gui/hooks";
// Try importing CloseIcon from MUI; fallback to a local SVG if missing
let CloseIcon: any;
try {
  // @ts-ignore
  CloseIcon = require("@mui/icons-material/Close").default;
} catch {
  CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  blurBackground?: boolean;
  xyz?: { x?: number; y?: number; z?: number };
  insets?: { top?: number; right?: number; bottom?: number; left?: number };
}

const Modal: React.FC<ModalProps> = ({
  open,
  title,
  onClose,
  children,
  width = 400,
  height = "auto",
  blurBackground = true,
  xyz,
  insets,
}) => {
  const theme = useGuiTheme();
  const zIndex = (theme as any)?.zIndex?.modal ?? (theme as any)?.zIndex?.drawer ?? 1300;

  if (!open) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        bgcolor: blurBackground ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.6)",
        backdropFilter: blurBackground ? "blur(8px)" : "none",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
        pt: `calc(16px + ${Number(insets?.top ?? 0)}px)`,
        pr: `calc(16px + ${Number(insets?.right ?? 0)}px)`,
        pb: `calc(16px + ${Number(insets?.bottom ?? 0)}px)`,
        pl: `calc(16px + ${Number(insets?.left ?? 0)}px)`,
        boxSizing: "border-box",
        zIndex,
      }}
      onClick={onClose}
    >
      <Box
        sx={{
          width,
          height,
          bgcolor: "background.paper",
          color: "text.primary",
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: 8,
          p: 3,
          animation: "fadeIn 0.2s ease",
          position: "relative",
          transform: `translate3d(${xyz?.x || 0}px, ${xyz?.y || 0}px, ${xyz?.z || 0}px)`,
          transformStyle: "preserve-3d",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            {title}
          </Typography>
        )}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "text.secondary",
            "&:hover": { color: "text.primary" },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box>{children}</Box>
      </Box>
    </Box>
  );
};

export default Modal;