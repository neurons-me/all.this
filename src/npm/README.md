<img src="https://res.cloudinary.com/dkwnxf6gm/image/upload/v1760629049/all.this_copy_vls5bp.png" alt="All.This" height="203">

# All.This
`all.this` is the public glue package for the neurons.me ecosystem.
It gives consumers one import point for the core modules while keeping runtime entrypoints explicit and lazy.

## Getting Started
```bash
npm i all.this
```

## Root Import
```ts
import { me, cleaker, GUI } from "all.this";
```

There is no default export. The root carries what runs anywhere, browser or Node:
- [.me](https://github.com/neurons-me/.me) re-exports the `this.me` kernel.
- [cleaker](https://github.com/neurons-me/Cleaker) re-exports the `cleaker` namespace parser.
- [.GUI](https://github.com/neurons-me/GUI) is a lazy facade, so importing `all.this` stays safe in Node and does not load React until asked.

```ts
const atoms = await GUI.atoms();
const runtime = await GUI.runtime();
const fullGui = await GUI.load();
```

The servers, [monad](https://github.com/neurons-me/monad) and [netget](https://github.com/neurons-me/netget), are not in the root: they run in Node only. Reach them through their subpaths (below).

## Subpaths
Use subpaths when you want a specific module surface:

```ts
import me from "all.this/me";
import cleaker from "all.this/cleaker";
import { createMonadApp } from "all.this/monad";   // needs `npm i monad.ai`
import NetGet from "all.this/netget";             // needs `npm i netget`

import { Box, Button } from "all.this/gui/atoms";
import { render } from "all.this/gui/runtime";
import { useMe } from "all.this/gui/react";
```

`monad.ai` and `netget` are optional peer dependencies: `npm i all.this` does not install the servers. Install the one you need next to it.

The full **GUI** surfaces (`all.this/gui`, `all.this/gui/molecules`, `all.this/gui/legacy`, and `all.this/gui/devtools`) are browser-facing and may require DOM globals.

## Changes in 2.0.0
- Installable from npm: 1.0.46 was published with `workspace:^` dependencies, which npm cannot resolve.
- The root no longer exports `monad`, `netget` or `NetGet`: use `all.this/monad` and `all.this/netget`.
- `monad.ai` and `netget` became optional peer dependencies.
- `all.this/boot` and `all.this/boot/browser` were removed.
- The `react-router-dom` peer was dropped: `this.gui` declares the version it needs.

## License
**MIT**
