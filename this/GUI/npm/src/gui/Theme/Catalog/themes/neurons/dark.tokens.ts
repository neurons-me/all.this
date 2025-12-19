// src/themes/catalog/neurons/dark.tokens.ts
// Neurons Dark Theme Tokens — overrides applied on top of global.tokens.json
const darkTokens = {
  "id": "neurons-dark",
  "$description": "Neurons Dark Theme Tokens — overrides applied on top of global.tokens.json",
  "color": {
    "primary": {
      "$type": "color",
      "$value": "#90caf9"
    },
    "secondary": {
      "$type": "color",
      "$value": "#6FC7B5"
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
      "default": { "$type": "color", "$value": "#121212" },
      "subtle": { "$type": "color", "$value": "#1a1a1a" },
      "strong": { "$type": "color", "$value": "#202020" }
    },
    "blur": {
      "light": { "$type": "color", "$value": "rgba(34, 83, 70, 0.55);" },
      "medium": { "$type": "color", "$value": "rgba(34, 83, 70, 0.69)" },
      "heavy": { "$type": "color", "$value": "rgba(21, 27, 25, 0.89);" },
      "all": { "$type": "color", "$value": "rgba(31, 38, 36, 0.98);" }
    }
  }
};

export default darkTokens;