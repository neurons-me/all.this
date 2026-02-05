# .GUI

A collection of components and building blocks enabling **.GUI** generation.
<img src="https://res.cloudinary.com/dkwnxf6gm/image/upload/w_180/v1761276578/this.gui.npm.png" alt="This.GUI logo" width="180" />

### Links
- **.GUI Website:** https://neurons-me.github.io/GUI/
- **Storybook:** https://neurons-me.github.io/storybook-static/

## Quick Start (npx)

##### Create a new app using this.GUI:

```bash
npx this.gui AppName
```

```bash
cd AppName
```

```bash
npm install
```

```bash
npm run dev
```

This generates a **minimal app** pre-wired with `this.gui`.

### What you get
- `src/main.tsx` boots a React app
- `Theme` is already mounted
- A simple `App.tsx` example using core atoms

<img src="https://res.cloudinary.com/dkwnxf6gm/image/upload/w_320/v1761281165/geometry_shapes-removebg-preview_anrdke.png" alt="Geometry shapes" width="244" />

### Next steps

###### Installing using npm:

```bash
npm install this.gui
```

All components are theme-aware and automatically inherit styles and tokens from the `Theme` provider

- Explore components in Storybook: https://neurons-me.github.io/GUI/storybook-static/
- Import atoms directly:

```ts
import { Button, Typography, Box } from "this.gui";
// or subpath (more explicit)
import { Button as AtomButton } from "this.gui/atoms";
```

### Add the stylesheet
`this.gui` ships a compiled stylesheet. Import it once at your app entry:

```ts
import "this.gui/style.css";
```

> **Tip:** If you're using the UMD build in a plain HTML page, include `styles.css` from the `dist/` folder and load `this.gui.umd.js` via a `<script>` tag.

## 🪐 License
MIT © [neurons.me](https://neurons.me)
