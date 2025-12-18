// src/themes/catalog/GhostShell/light.tokens.ts
const lightTokens = {
  "id": "LunaHex-light",
  "extends": "global.tokens.json",
  "color": {
    "primary": { "$type": "color", "$value": "#00c77f" },
    "secondary": { "$type": "color", "$value": "#00b8ff" },
    "icon": { "$type": "color", "$value": "#007f73" },
    "default": { "$type": "color", "$value": "#f4f8f6" },
    "paper": { "$type": "color", "$value": "#ffffff" },
    "nav": { "$type": "color", "$value": "#f1fef9" },
    "textPrimary": { "$type": "color", "$value": "#061a14" },
    "textSecondary": { "$type": "color", "$value": "#34584f" },
    "link": { "$type": "color", "$value": "#009f77" },
    "linkVisited": { "$type": "color", "$value": "#007866" },
    "border": { "$type": "color", "$value": "rgba(0,160,120,0.25)" },
    "section": {
      "default": { "$type": "color", "$value": "#e9fcf4" },
      "subtle": { "$type": "color", "$value": "#f8fffb" },
      "strong": { "$type": "color", "$value": "#d6f5ec" }
    },
    "blur": {
      "light": { "$type": "color", "$value": "rgba(245, 255, 250, 0.7)" },
      "medium": { "$type": "color", "$value": "rgba(240, 255, 250, 0.85)" },
      "heavy": { "$type": "color", "$value": "rgba(235, 255, 250, 1)" },
      "all": { "$type": "color", "$value": "rgba(230, 255, 245, 1)" }
    },
    "accent": {
      "glow": { "$type": "color", "$value": "#00ffaa" },
      "pulse": { "$type": "color", "$value": "#00d0ff" }
    }
  },
  "font": {
    "body": { "$type": "font", "$value": "'Share Tech Mono', 'Nunito Sans', monospace" },
    "heading": { "$type": "font", "$value": "'Poppins', sans-serif" }
  }
};

export default lightTokens;