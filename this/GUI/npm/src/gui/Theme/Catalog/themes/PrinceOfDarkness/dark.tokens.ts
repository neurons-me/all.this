// src/themes/catalog/PrinceOfDarkness/dark.tokens.ts
// Prince Of Darkness — Dark Mode Tokens
// Gothic, cyber-metal aesthetic with deep black, muted burgundy, and teal-gray highlights.
const darkTokens = {
  "id": "PrinceOfDarkness-dark",
  "$description": "Prince Of Darkness Dark Theme — gothic cyber-metal aesthetic for This.GUI, with neutral elegance",
  "color": {
    "primary": { "$type": "color", "$value": "#7a3b5d" }, // Burdeos tenue, más sofisticado
    "secondary": { "$type": "color", "$value": "#5a3d9a" }, // Púrpura oscuro gótico
    "accent": { "$type": "color", "$value": "#00d1b2" }, // Verde-azul metálico suave
    "icon": { "$type": "color", "$value": "#c8c8c8" },
    "background": {
      "default": { "$type": "color", "$value": "#0d0d0f" },
      "paper": { "$type": "color", "$value": "#161618" },
      "nav": { "$type": "color", "$value": "#1c1c1f" }
    },
    "textPrimary": { "$type": "color", "$value": "#f2f2f2" },
    "textSecondary": { "$type": "color", "$value": "#a3a3a3" },
    "link": { "$type": "color", "$value": "#00bfa5" },
    "linkVisited": { "$type": "color", "$value": "#00897b" },
    "border": { "$type": "color", "$value": "rgba(255,255,255,0.1)" },
    "section": {
      "default": { "$type": "color", "$value": "#131314" },
      "subtle": { "$type": "color", "$value": "#1a1a1c" },
      "strong": { "$type": "color", "$value": "#0a0a0b" },
      "accent": { "$type": "color", "$value": "#202228" },
      "highlight": { "$type": "color", "$value": "#2a2f34" }
    },
    "blur": {
      "light": { "$type": "color", "$value": "rgba(18, 18, 20, 0.4)" }, // dark neutral veil
      "medium": { "$type": "color", "$value": "rgba(15, 15, 18, 0.65)" }, // deeper steel tone
      "heavy": { "$type": "color", "$value": "rgba(12, 12, 16, 0.9)" }, // obsidian black with faint violet edge
      "all": { "$type": "color", "$value": "rgba(10, 10, 14, 1)" } // complete gothic darkness
    }
  },
  "effects": {
    "shadow": {
      "$type": "shadow",
      "$value": "0px 0px 12px rgba(0, 209, 178, 0.15)"
    },
    "glow": {
      "$type": "shadow",
      "$value": "0px 0px 18px rgba(90, 61, 154, 0.25)"
    }
  }
};

export default darkTokens;