// src/themes/catalog/Seafoam/dark.tokens.ts
// Seafoam — Dark Mode Tokens
// Seafoam — Dark Mode Tokens
// Tranquil oceanic elegance with deep forest teal, soft coral, and misty neutrals.
const darkTokens = {
  "id": "Seafoam-dark",
  "$description": "Seafoam Dark Theme — a tranquil, feminine oceanic palette blending deep teal, blush, and warm sand accents for a serene night mood.",
  "color": {
    "primary": { "$type": "color", "$value": "#244C4E" }, // deep sea green
    "secondary": { "$type": "color", "$value": "#457E85" }, // misty teal
    "accent": { "$type": "color", "$value": "#F0B7A4" }, // soft blush coral
    "icon": { "$type": "color", "$value": "#CBD6D4" }, // soft silver
    "background": {
      "default": { "$type": "color", "$value": "#0F1919" }, // deep ocean night
      "paper": { "$type": "color", "$value": "#182423" }, // soft teal black
      "nav": { "$type": "color", "$value": "#1D2E2C" } // cool forest depth
    },
    "textPrimary": { "$type": "color", "$value": "#EAEDED" },
    "textSecondary": { "$type": "color", "$value": "#AFC3C2" },
    "link": { "$type": "color", "$value": "#5FA8B0" },
    "linkVisited": { "$type": "color", "$value": "#7AB9BE" },
    "border": { "$type": "color", "$value": "rgba(255,255,255,0.08)" },
    "section": {
      "default": { "$type": "color", "$value": "#162322" }, // rich teal-black section
      "subtle": { "$type": "color", "$value": "#1E2E2D" }, // cool mist teal
      "strong": { "$type": "color", "$value": "#0E1717" }, // deep focus area
      "accent": { "$type": "color", "$value": "#263937" }, // soft forest teal accent
      "highlight": { "$type": "color", "$value": "#314B48" } // elegant muted jade
    },
    "blur": {
      "light":   { "$type": "color", "$value": "rgba(22, 44, 46, 0.35)" }, // twilight teal mist
      "medium":  { "$type": "color", "$value": "rgba(18, 38, 40, 0.55)" }, // deep aqua reflection
      "heavy":   { "$type": "color", "$value": "rgba(14, 32, 34, 0.85)" }, // moonlit sea surface
      "all":     { "$type": "color", "$value": "rgba(10, 26, 28, 1)" } // full oceanic darkness
    }
  },
  "effects": {
    "shadow": {
      "$type": "shadow",
      "$value": "0px 2px 10px rgba(79, 138, 139, 0.2)"
    },
    "glow": {
      "$type": "shadow",
      "$value": "0px 0px 14px rgba(240, 183, 164, 0.25)"
    }
  }
};

export default darkTokens;