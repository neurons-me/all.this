//themes/styles/theme.tokens.ts
export const themeTokens = {
  description: "Unified base design tokens for This.GUI — used as foundation for all themes and modes.",
  radius: {
    md: {
      type: "radius",
      value: "10px"
    }
  },
  spacing: {
    base: {
      type: "spacing",
      value: "8"
    }
  },
  border: {
    default: {
      type: "color",
      value: "rgba(0, 0, 0, 0.08)"
    }
  },
  font: {
    family: {
      type: "fontFamily",
      value: "Roboto, sans-serif"
    },
    weightBold: {
      type: "fontWeight",
      value: "700"
    },
    weightSemibold: {
      type: "fontWeight",
      value: "600"
    },
    sizeBase: {
      type: "fontSize",
      value: "16"
    },
    letterTight: {
      type: "letterSpacing",
      value: "-0.01em"
    }
  },
  color: {
    description: "Extended semantic colors, gradients, overlays",
    success: { type: "color", value: "#4caf50" },
    warning: { type: "color", value: "#ff9800" },
    error: { type: "color", value: "#f44336" },
    info: { type: "color", value: "#2196f3" },
    gradientPrimary: { type: "gradient", value: "linear-gradient(135deg, #00aa96 0%, #008c7d 100%)" }
  },
  insets: {
    description: "Offsets reserved for permanent drawers",
    type: "object",
    left: {
      type: "size",
      value: "0px"
    },
    right: {
      type: "size",
      value: "0px"
    }
  },
  shadows: {
    description: "Consistent elevation levels, AR/3D ready",
    sm: { type: "shadow", value: "0px 1px 2px rgba(0, 0, 0, 0.05)" },
    md: { type: "shadow", value: "0px 3px 6px rgba(0, 0, 0, 0.1)" },
    lg: { type: "shadow", value: "0px 8px 16px rgba(0, 0, 0, 0.15)" }
  },
  zIndex: {
    description: "Advanced layering control",
    nav: { type: "number", value: 1100 },
    modal: { type: "number", value: 1300 },
    tooltip: { type: "number", value: 1500 }
  },
  breakpoints: {
    description: "Declarative responsive interfaces",
    xs: { type: "breakpoint", value: "0px" },
    sm: { type: "breakpoint", value: "600px" },
    md: { type: "breakpoint", value: "900px" },
    lg: { type: "breakpoint", value: "1200px" },
    xl: { type: "breakpoint", value: "1536px" }
  },
  motion: {
    description: "Animation and transition tokens",
    durationFast: { type: "duration", value: "150ms" },
    durationBase: { type: "duration", value: "300ms" },
    easingStandard: { type: "easing", value: "cubic-bezier(0.4, 0, 0.2, 1)" }
  },
  opacity: {
    description: "Universal interaction effects",
    disabled: { type: "opacity", value: "0.38" },
    hover: { type: "opacity", value: "0.08" },
    focus: { type: "opacity", value: "0.12" }
  },
  icon: {
    description: "Scalable icon sizes for generated GUIs",
    sm: { type: "size", value: "16px" },
    md: { type: "size", value: "24px" },
    lg: { type: "size", value: "32px" }
  },
  lineHeight: {
    description: "Better typographic control",
    tight: { type: "lineHeight", value: "1.1" },
    base: { type: "lineHeight", value: "1.5" },
    relaxed: { type: "lineHeight", value: "1.75" }
  }
};