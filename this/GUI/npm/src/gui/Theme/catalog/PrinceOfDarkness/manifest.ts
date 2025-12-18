// src/themes/tokens/neurons/manifest.ts
import type { ThemeManifest } from '@/types/theme';
import badgeImage from './princeOfDarkness.png';
import lightTokens from './light.tokens';
import darkTokens from './dark.tokens';
const PrinceOfDarknessManifest: ThemeManifest = {
  themeId: 'prince-of-darkness',
  themeName: 'Prince Of Darkness',
  description: 'A dark theme with a touch of neon, perfect for night owls and coding enthusiasts.',
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
export default PrinceOfDarknessManifest;