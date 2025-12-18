// src/themes/tokens/Seafoam/manifest.ts
import type { ThemeManifest } from '@/types/theme';
import badgeImage from './seaFoam.png';
import lightTokens from './light.tokens';
import darkTokens from './dark.tokens';
const SeafoamManifest: ThemeManifest = {
  themeId: 'seafoam',
  themeName: 'Seafoam',
  description: 'A refreshing theme inspired by the colors of the sea, perfect for a calm and serene coding experience.',
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
export default SeafoamManifest;