// src/themes/catalog/MUI/dark.tokens.ts
// MUI Dark Theme Tokens — overrides applied on top of global.tokens.json
const darkTokens = {
  "id": "MUI-dark",
  "$description": "MUI Dark Theme Tokens — overrides applied on top of global.tokens.json",
  "color": {
    "primary": {
      "$type": "color",
      "$value": "#90caf9"
    },
    "secondary": {
      "$type": "color",
      "$value": "#f48fb1"
    },
    "icon": {
      "$type": "color",
      "$value": "#a8a8a8"
    },
    "background": {
      "default": { "$type": "color", "$value": "#121214" },
      "paper": { "$type": "color", "$value": "#181a1c" },
      "nav": { "$type": "color", "$value": "rgba(18,18,20,0.95)" }
    },
    "textPrimary": {
      "$type": "color",
      "$value": "#ffffff"
    },
    "textSecondary": {
      "$type": "color",
      "$value": "rgba(255,255,255,0.75)"
    },
    "link": {
      "$type": "color",
      "$value": "#00aa96"
    },
    "linkVisited": {
      "$type": "color",
      "$value": "#008278"
    },
    "border": {
      "$type": "color",
      "$value": "rgb(45,45,55)"
    },
    "section": {
      "default": { "$type": "color", "$value": "#181818" },
      "subtle": { "$type": "color", "$value": "#1c1c1c" },
      "strong": { "$type": "color", "$value": "#222" }
    },
    "blur": {
      "light": { "$type": "color", "$value": "rgba(18, 18, 20, 0.55)" },
      "medium": { "$type": "color", "$value": "rgba(18, 18, 20, 0.69)" },
      "heavy": { "$type": "color", "$value": "rgba(18, 18, 20, .89)" },
      "all": { "$type": "color", "$value": "rgba(18, 18, 20, 1)" }
    }
  }
};

export default darkTokens;