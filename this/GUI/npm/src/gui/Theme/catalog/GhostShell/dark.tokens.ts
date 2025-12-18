// src/themes/catalog/GhostShell/dark.tokens.ts
const darkTokens = {
  "id": "LunaHex-dark",
  "$description": "LunaHex Cyberpunk Dark — matrix-inspired neon aesthetic with ghostly green glows and deep cyber shadows.",
  "color": {
    "primary": { "$type": "color", "$value": "#00ff9f" },
    "secondary": { "$type": "color", "$value": "#00e0ff" },
    "icon": { "$type": "color", "$value": "#7fffd4" },
    "background": {
      "default": { "$type": "color", "$value": "#06080a" },
      "paper": { "$type": "color", "$value": "#0b1014" },
      "nav": { "$type": "color", "$value": "rgba(10,14,18,0.96)" }
    },
    "textPrimary": { "$type": "color", "$value": "#e0fff3" },
    "textSecondary": { "$type": "color", "$value": "rgba(180,255,220,0.75)" },
    "link": { "$type": "color", "$value": "#00ffc3" },
    "linkVisited": { "$type": "color", "$value": "#00a8a8" },
    "border": { "$type": "color", "$value": "rgba(0,255,160,0.25)" },
    "section": {
      "default": { "$type": "color", "$value": "#0a0f10" },
      "subtle": { "$type": "color", "$value": "#0f1719" },
      "strong": { "$type": "color", "$value": "#030506" }
    },
    "blur": {
      "light": { "$type": "color", "$value": "rgba(2, 13, 7, 0.55)" },
      "medium": { "$type": "color", "$value": "rgba(2, 13, 7, 0.69)" },
      "heavy": { "$type": "color", "$value": "rgba(0, 9, 6, 0.89)" },
      "all": { "$type": "color", "$value": "rgba(2, 25, 15, 1)" }
    },
    "accent": {
      "glow": { "$type": "color", "$value": "#00ffcc" },
      "pulse": { "$type": "color", "$value": "#00c3ff" }
    }
  },
  "font": {
    "family": {
      "$type": "fontFamily",
      "$value": "'Share Tech Mono', 'Poppins', monospace"
    }
  }
};

export default darkTokens;