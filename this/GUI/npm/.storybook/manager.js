import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';
import { themes } from 'storybook/theming';


addons.setConfig({
  theme: create({
    theme: themes.dark,
    base: 'dark', // o 'light'
    brandTitle: 'This.GUI - Storybook',
    brandUrl: 'https://neurons.me',
    brandImage: '/GUI.png',  // served from project ./public/logo.svg
    brandTarget: '_self',
  }),
});