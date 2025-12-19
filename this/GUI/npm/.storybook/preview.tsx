// .storybook/preview.tsx
import React from 'react'
import { CssBaseline } from '@mui/material'
import 'material-symbols/rounded.css';
import { GuiProvider } from '../src/gui/Theme/GuiProvider';
import { themes } from 'storybook/internal/theming';
import { MemoryRouter } from 'react-router-dom';
export const decorators = [
  (Story: React.FC) => (
      <GuiProvider initialThemeId="neurons.me" initialMode="light">
        <CssBaseline />
        <MemoryRouter initialEntries={['/']}>
          <Story />
        </MemoryRouter>
      </GuiProvider>
  ),
];

export const parameters = {
  controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  backgrounds: { disable: true },
  docs: { page: null, theme: themes.dark },
  // Sidebar ordering
  options: {
    storySort: {
      order: [
        'Docs',
        ['Home'],
        'gui',
        'Layout',
        'Theme',
        'atoms',
        'molecules',
        'components',
      ],
    },
  },
};
