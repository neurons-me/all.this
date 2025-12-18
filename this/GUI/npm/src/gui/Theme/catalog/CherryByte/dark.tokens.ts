// src/themes/catalog/CherryByte/dark.tokens.ts
// Cherry Byte Modern Dark — Deep Green & Blush Harmony
const darkTokens = {
  "id": "cherrybyte-dark",
  "$description": "Cherry Byte Dark — a youthful, elegant, and modern palette blending deep teal-green and soft blush tones for calm, sensual contrast.",
  "color": {
    "primary": { "$type": "color", "$value": "#e7a9a4" }, // blush pink
    "secondary": { "$type": "color", "$value": "#2b3f3c" }, // deep forest green
    "accent": { "$type": "color", "$value": "#d77c73" }, // coral accent
    "icon": { "$type": "color", "$value": "#f5eaea" },
    "background": {
      "default": { "$type": "color", "$value": "#192524" }, // elegant deep teal
      "paper": { "$type": "color", "$value": "#213230" }, // slightly lighter greenish tone
      "nav": { "$type": "color", "$value": "#1a2928" } // subtle depth for navigation
    },
    "textPrimary": { "$type": "color", "$value": "#f9f4f3" },
    "textSecondary": { "$type": "color", "$value": "rgba(255, 235, 230, 0.85)" },
    "link": { "$type": "color", "$value": "#e7a9a4" },
    "linkVisited": { "$type": "color", "$value": "#d5968f" },
    "border": { "$type": "color", "$value": "rgba(255, 220, 210, 0.2)" },
    "section": {
      "default": { "$type": "color", "$value": "#202d2c" }, // soft green charcoal
      "subtle": { "$type": "color", "$value": "#253837" }, // calm depth
      "strong": { "$type": "color", "$value": "#324845" }, // bold modern layer
      "accent": { "$type": "color", "$value": "#3d5450" }, // moody teal highlight
      "highlight": { "$type": "color", "$value": "#d48d88" } // blush highlight
    },
    "blur": {
      "light": { "$type": "color", "$value": "rgba(30, 25, 28, 0.34)" },
      "medium": { "$type": "color", "$value": "rgba(34, 28, 30, 0.55)" },
      "heavy": { "$type": "color", "$value": "rgba(38, 30, 32, 0.85)" },
      "all": { "$type": "color", "$value": "rgba(42, 32, 34, 1)" }
    }
  },
  "effects": {
    "shadow": {
      "$type": "shadow",
      "$value": "0px 8px 24px rgba(25, 37, 36, 0.5)"
    },
    "glow": {
      "$type": "shadow",
      "$value": "0px 0px 28px rgba(231, 169, 164, 0.25)"
    }
  }
};

export default darkTokens;