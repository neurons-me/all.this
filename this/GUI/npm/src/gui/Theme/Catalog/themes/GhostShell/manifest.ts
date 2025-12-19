// src/themes/catalog/GhostShell/manifest.ts
import type { ThemeManifest } from '@/types/theme';
import badgeImage from './ghost.png';
import lightTokens from './light.tokens';
import darkTokens from './dark.tokens';
const ghostShellManifest: ThemeManifest = {
  themeId: 'ghost.shell',
  themeName: 'GhostShell',
  description: 'A sleek, modern theme with a dark aesthetic, perfect for late-night sessions.',
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
export default ghostShellManifest;