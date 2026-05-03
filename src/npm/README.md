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
import { me, cleaker, GUI, monad, netget, NetGet } from "all.this";
```

There is no default export. The root surface is intentionally named.
- [.me](https://github.com/neurons-me/.me) re-exports the `this.me` identity kernel.
- [cleaker](https://github.com/neurons-me/Cleaker) re-exports the `cleaker` namespace parser.
- [monad](https://github.com/neurons-me/monad) exposes `createMonadApp`, `bootstrapMonad`, and `startMonad`.
- [netget ](https://github.com/neurons-me/netget)exposes the *import-safe* NetGet class.
- [.GUI](https://github.com/neurons-me/GUI) is a lazy facade so importing `all.this` stays safe in Node.

```ts
const atoms = await GUI.atoms();
const runtime = await GUI.runtime();
const fullGui = await GUI.load();
```

## Subpaths
Use subpaths when you want a specific module surface:

```ts
import me from "all.this/me";
import cleaker from "all.this/cleaker";
import { createMonadApp } from "all.this/monad";
import NetGet from "all.this/netget";

import { Box, Button } from "all.this/gui/atoms";
import { render } from "all.this/gui/runtime";
import { useMe } from "all.this/gui/react";
```

The full **GUI** surfaces (`all.this/gui`, `all.this/gui/molecules`, `all.this/gui/legacy`, and `all.this/gui/devtools`) are browser-facing and may require DOM globals.

## License
**MIT**
