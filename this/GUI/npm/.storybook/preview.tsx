// .storybook/preview.tsx
import React from 'react'
import { CssBaseline } from '@mui/material'
import { GuiProvider } from '../src/gui/Theme/GuiProvider';
import { getFlatGuiThemes } from '../src/gui/Theme/utils/catalog';
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
}