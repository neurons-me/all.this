// src/themes/catalog/neurons/manifest.ts
import type { ThemeManifest } from '@/types/theme';
import badgeImage from './neurons.me.png';
import lightTokens from './light.tokens';
import darkTokens from './dark.tokens';
const neuronsManifest: ThemeManifest = {
  themeId: 'neurons.me',
  themeName: 'neurons.me',
  description: 'A modern, flexible theme for the Neuroverse, designed to enhance productivity and creativity.',
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
export default neuronsManifest;