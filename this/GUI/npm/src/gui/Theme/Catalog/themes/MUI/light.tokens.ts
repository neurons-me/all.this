// src/themes/catalog/MUI/light.tokens.ts
const lightTokens = {
  "$description": "Mui Light Theme theme — part of This.GUI ecosystem",
  "id": "MUI-light",
  "extends": "global.tokens.json",
  "color": {
    "primary": {
      "$type": "color",
      "$value": "#0a3a42"
    },
    "secondary": {
      "$type": "color",
      "$value": "#e5396f"
    },
    "icon": {
      "$type": "color", 
      "$value": "#5e5e5e"
    },
    "default": {
      "$type": "color",
      "$value": "#f8f9fa"
    },
    "paper": {
      "$type": "color",
      "$value": "#ffffff"
    },
    "nav": {
      "$type": "color",
      "$value": "#fdfdfd"
    },
    "textPrimary": {
      "$type": "color",
      "$value": "#111111"
    },
    "textSecondary": {
      "$type": "color",
      "$value": "#444444"
    },
    "link": {
      "$type": "color",
      "$value": "#008c7d"
    },
    "linkVisited": {
      "$type": "color",
      "$value": "#006e64"
    },
    "border": {
      "$type": "color",
      "$value": "rgba(0,0,0,0.08)"
    },
    "section": {
      "default": {
        "$type": "color",
        "$value": "#f8f9fa"
      },
      "subtle": {
        "$type": "color",
        "$value": "#ffffff"
      },
      "strong": {
        "$type": "color",
        "$value": "#e9ecef"
      }
    },
    "blur": {
      "light": { "$type": "color", "$value": "rgba(250, 250, 250, 0.34)" },
      "medium": { "$type": "color", "$value": "rgba(245, 245, 245, 0.55)" },
      "heavy": { "$type": "color", "$value": "rgba(240, 240, 240, 0.89)" },
      "all": { "$type": "color", "$value": "rgba(235, 235, 235, 1)" }
    }
  }
};

export default lightTokens;