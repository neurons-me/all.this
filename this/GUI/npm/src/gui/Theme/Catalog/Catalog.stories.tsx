import type { Meta, StoryObj } from '@storybook/react';
import ThemesCatalog from './Catalog';

// Optional: Storybook links addon (if installed). We also provide a hash fallback.
import { linkTo } from '@storybook/addon-links';

// ======================= Meta =======================
const meta: Meta<typeof ThemesCatalog> = {
  title: 'GUI/Theme/Catalog',
  component: ThemesCatalog,
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      const goToPalette = () => {
        try {
          // If addon-links is present, this will navigate within Storybook
          const fn = linkTo('Theme/Palette', 'Default');
          if (typeof fn === 'function') return fn();
        } catch {
          // ignore and fallback
        }

        // Fallback: direct hash navigation (works even without addon-links)
        // Adjust the story id if your Palette story uses a different title.
        window.location.hash = '#/story/theme-palette--default';
      };

      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--gui-bg, #0b0f14)',
          }}
        >
          {/* TopBar */}
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(10px)',
              background: 'rgba(10, 14, 20, 0.72)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontWeight: 700, letterSpacing: -0.2 }}>Themes Catalog</div>
              <div style={{ opacity: 0.7, fontSize: 12 }}>Browse & select GUI themes</div>
            </div>

            <button
              type="button"
              onClick={goToPalette}
              title="Open Palette stories"
              aria-label="Open Palette stories"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.92)',
                cursor: 'pointer',
              }}
            >
              {/* Palette icon (inline SVG) */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 3c-4.97 0-9 3.58-9 8c0 2.76 1.66 5.2 4.26 6.67c.58.33.94.95.94 1.61V21c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-1.18c0-.66.36-1.28.94-1.61C19.34 16.2 21 13.76 21 11c0-4.42-4.03-8-9-8zm2.5 7c.83 0 1.5.67 1.5 1.5S15.33 13 14.5 13S13 12.33 13 11.5S13.67 10 14.5 10zM7.5 13C6.67 13 6 12.33 6 11.5S6.67 10 7.5 10S9 10.67 9 11.5S8.33 13 7.5 13zm2-4.5C8.67 8.5 8 7.83 8 7s.67-1.5 1.5-1.5S11 6.17 11 7s-.67 1.5-1.5 1.5zm5 0C13.67 8.5 13 7.83 13 7s.67-1.5 1.5-1.5S16 6.17 16 7s-.67 1.5-1.5 1.5z"/>
              </svg>
            </button>
          </div>

          {/* Story content */}
          <div style={{ padding: 16, minHeight: 320, flex: 1 }}>
            <Story />
          </div>
        </div>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        component: `
The **ThemesCatalog** component renders a visual interface to explore and select available GUI themes for your application.

It fetches all theme configurations from the \`getGuiThemes()\` utility and displays them using a visually rich card interface. You can toggle between **grid** and **list** layouts and switch between light/dark previews per theme. When a theme is selected, it is applied globally via the context provided by \`useThemeContext()\`.

---
## Features
- Visual layout for theme browsing.
- Switch between **grid** and **list** variants.
- Light/dark mode preview toggle.
- Swatches preview for key palette values: \`primary\`, \`secondary\`, and \`background\`.
- Selectable themes that apply across your GUI via context.
- JSON-compatible configuration for declarative UI building.
- Fully themed with **This.GUI** primitives.

---
## Props
- \`variant?: 'grid' | 'list'\` — controls layout format. Defaults to \`grid\`.
- \`sx?: SxProps\` — accepts style overrides via MUI’s \`sx\` prop.

---
## Basic Usage
~~~jsx
<ThemesCatalog variant="grid" />
<ThemesCatalog variant="list" />
~~~

## Declarative JSON Configuration
~~~json
{
  "type": "ThemesCatalog",
  "props": {
    "variant": "list"
  }
}
~~~

This component is ideal for apps that allow users to select their visual theme from a set of predefined theme options. It pairs well with This.GUI’s theme management context and is useful in both developer-facing configuration tools and end-user customization interfaces.
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'radio' },
      options: ['grid', 'list'],
      description: 'Choose layout variant',
    },
  },
  args: {
    variant: 'grid',
  },
};

export default meta;
type Story = StoryObj<typeof ThemesCatalog>;

// ======================= Stories =======================
export const Playground: Story = {
  args: {
    variant: 'grid',
  },
};

export const ListVariant: Story = {
  name: 'List layout',
  args: {
    variant: 'list',
  },
};