// .storybook/preview.tsx
import React from 'react'
import { CssBaseline } from '@mui/material'
import 'material-symbols/rounded.css';
import { Theme } from '../index';
import { themes } from 'storybook/theming';
import { MemoryRouter } from 'react-router-dom';
export const decorators = [
  (Story: React.FC) => (
      <Theme initialThemeId="neurons.me" initialMode="light">
        <CssBaseline />
        <MemoryRouter initialEntries={['/']}>
          <Story />
        </MemoryRouter>
      </Theme>
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

  a11y: {
    // 'todo' - show a11y violations in the test UI only
    // 'error' - fail CI on a11y violations
    // 'off' - skip a11y checks entirely
    test: 'todo'
  }
};
