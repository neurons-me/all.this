// src/themes/catalog/neurons/manifest.ts
import type { ThemeManifest } from '@/types/theme';
import badgeImage from './LunaHex.png';
import lightTokens from './light.tokens';
import darkTokens from './dark.tokens';
const lunaManifest: ThemeManifest = {
  themeId: 'luna',
  themeName: 'LunaHex',
  description: 'Luna Hex theme with light and dark modes.',
  author: 'suiGn',
  version: '1.0.0',
  license: 'MIT',
  homepage: 'https://neurons.me/',
  tags: ['official', 'default'],
  createdAt: '2025-09-16T00:00:00.000Z',
  updatedAt: '2025-09-16T00:00:00.000Z',
  badgeUrl: badgeImage,
  mode: {
    light: lightTokens,
    dark: darkTokens,
  },
  defaultMode: 'dark'
};
export default lunaManifest;