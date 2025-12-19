// src/themes/catalog/CherryByte/light.tokens.ts
const lightTokens = {
  "$description": "Cherry Byte Light Theme — sensual, elegant, and emotionally evocative feminine palette inspired by rose light and electric bloom.",
  "id": "cherryByte-light",
  "extends": "global.tokens.json",
  "color": {
    "primary": { "$type": "color", "$value": "#d6336c" }, // Vibrant cherry pink
    "secondary": { "$type": "color", "$value": "#a8457a" }, // Muted plum rose
    "accent": { "$type": "color", "$value": "#ff80ab" }, // Luminous magenta accent
    "icon": { "$type": "color", "$value": "#643b4c" },
    "background": {
      "default": { "$type": "color", "$value": "#f9f3f5" }, // Blush rose white
      "paper": { "$type": "color", "$value": "#fffafb" }, // Ultra light rose
      "nav": { "$type": "color", "$value": "#f2e3e8" } // Warm muted cherry
    },
    "textPrimary": { "$type": "color", "$value": "#381e29" },
    "textSecondary": { "$type": "color", "$value": "#5c3a49" },
    "link": { "$type": "color", "$value": "#c2185b" },
    "linkVisited": { "$type": "color", "$value": "#9c1550" },
    "border": { "$type": "color", "$value": "rgba(210, 120, 150, 0.25)" },
    "section": {
      "default": { "$type": "color", "$value": "#f8eef1" }, // Creamy cherry mist
      "subtle": { "$type": "color", "$value": "#fff5f8" }, // Barely pink highlight
      "strong": { "$type": "color", "$value": "#f0dde3" }, // Deeper rose canvas
      "accent": { "$type": "color", "$value": "#ffd4e1" }, // Soft cherry accent glow
      "highlight": { "$type": "color", "$value": "#ffe2ec" } // Radiant blush aura
    },
    "blur": {
      "light": { "$type": "color", "$value": "rgba(255, 245, 248, 0.45)" },
      "medium": { "$type": "color", "$value": "rgba(255, 240, 246, 0.65)" },
      "heavy": { "$type": "color", "$value": "rgba(255, 230, 242, 0.85)" },
      "all": { "$type": "color", "$value": "rgba(255, 225, 238, 1)" }
    }
  },
  "effects": {
    "shadow": {
      "$type": "shadow",
      "$value": "0px 6px 18px rgba(180, 70, 120, 0.15)"
    },
    "glow": {
      "$type": "shadow",
      "$value": "0px 0px 12px rgba(255, 128, 171, 0.25)"
    }
  }
};

export default lightTokens;