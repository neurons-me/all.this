// src/themes/Seafoam/light.tokens.ts
const lightTokens = {
  "$description": "Seafoam Light theme — a fresh, tranquil palette inspired by ocean hues and coastal light.",
  "id": "Seafoam-light",
  "extends": "global.tokens.json",
  "color": {
    "primary": { "$type": "color", "$value": "#2C6675" }, // deep teal blue
    "secondary": { "$type": "color", "$value": "#5FA8B0" }, // cool sea blue
    "accent": { "$type": "color", "$value": "#A9D7D3" }, // soft seafoam
    "icon": { "$type": "color", "$value": "#37474f" }, // dark slate gray
    "background": {
      "default": { "$type": "color", "$value": "#E8F0EF" }, // misty aqua-white
      "paper": { "$type": "color", "$value": "#F6F9F9" }, // light and airy
      "nav": { "$type": "color", "$value": "#D6E7E5" } // subtle ocean breeze tone
    },
    "textPrimary": { "$type": "color", "$value": "#1C2626" },
    "textSecondary": { "$type": "color", "$value": "rgba(28, 38, 38, 0.7)" },
    "link": { "$type": "color", "$value": "#2C6675" },
    "linkVisited": { "$type": "color", "$value": "#457B84" },
    "border": { "$type": "color", "$value": "rgba(44, 102, 117, 0.2)" },
    "section": {
      "default": { "$type": "color", "$value": "#E3EFEE" }, // pale aqua background
      "subtle": { "$type": "color", "$value": "#F5FBFB" }, // soft ocean mist
      "strong": { "$type": "color", "$value": "#D1E3E1" }, // calm turquoise section
      "accent": { "$type": "color", "$value": "#F3E0CF" }, // sandy warmth
      "highlight": { "$type": "color", "$value": "#FFE9DD" } // light coral-beige
    },
    "blur": {
      "light": { "$type": "color", "$value": "rgba(200, 245, 250, 0.45)" }, // seafoam mist — bright and fresh
      "medium": { "$type": "color", "$value": "rgba(180, 235, 240, 0.65)" }, // soft aqua drift
      "heavy": { "$type": "color", "$value": "rgba(160, 225, 235, 0.85)" }, // deep ocean calm
      "all": { "$type": "color", "$value": "rgba(145, 215, 230, 1)" } // Caribbean blue glow
    }
  },
  "effects": {
    "shadow": {
      "$type": "shadow",
      "$value": "0px 4px 12px rgba(28, 38, 38, 0.1)"
    },
    "glow": {
      "$type": "shadow",
      "$value": "0px 0px 16px rgba(95, 168, 176, 0.25)"
    }
  }
};

export default lightTokens;