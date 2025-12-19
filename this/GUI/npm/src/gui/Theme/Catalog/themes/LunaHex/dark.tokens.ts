// src/themes/catalog/LunaHex/dark.tokens.ts
// Luna Hex Dark Theme Tokens — overrides applied on top of global.tokens.json
const darkTokens = {
  "id": "LunaHex-dark",
  "$description": "Luna Hex Dark Theme Tokens — mystical, elegant dark palette with lunar tones.",
  "color": {
    "primary": { "$type": "color", "$value": "#a692f4" }, // soft lavender glow
    "secondary": { "$type": "color", "$value": "#f6a6de" }, // rose moonlight
    "icon": { "$type": "color", "$value": "#cfc9ff" }, // silver-white icons
    "background": {
      "default": { "$type": "color", "$value": "#0f1016" }, // deep cosmic blue-black
      "paper": { "$type": "color", "$value": "#171822" }, // subtle moon haze
      "nav": { "$type": "color", "$value": "rgba(17,18,25,0.96)" } // translucent dark
    },
    "textPrimary": { "$type": "color", "$value": "#f2efff" },
    "textSecondary": { "$type": "color", "$value": "rgba(230,228,255,0.7)" },
    "link": { "$type": "color", "$value": "#b8a3ff" },
    "linkVisited": { "$type": "color", "$value": "#9c87f2" },
    "border": { "$type": "color", "$value": "rgba(160,160,200,0.25)" },
    "section": {
      "default": { "$type": "color", "$value": "#141421" },
      "subtle": { "$type": "color", "$value": "#1a1a2a" },
      "strong": { "$type": "color", "$value": "#0c0c15" }
    },
    "blur": {
      "light": { "$type": "color", "$value": "rgba(18, 17, 28, 0.55)" },
      "medium": { "$type": "color", "$value": "rgba(20, 19, 32, 0.69)" },
      "heavy": { "$type": "color", "$value": "rgba(17, 16, 24, 0.89)" },
      "all": { "$type": "color", "$value": "rgba(16, 15, 24, 1)" }
    }
  }
};

export default darkTokens;