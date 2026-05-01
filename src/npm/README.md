<img src="https://docs.neurons.me/media/all.this.png" alt="All.This" width="377" height="289">

# All.This

`all.this` is the public glue package for the neurons.me ecosystem.

It gives consumers one import point for the core modules while keeping runtime entrypoints explicit and lazy.

## Install

```bash
npm i all.this
```

## Root Import

```ts
import { me, cleaker, GUI, monad, netget, NetGet } from "all.this";
```

There is no default export. The root surface is intentionally named.

- `me` re-exports the `this.me` identity kernel.
- `cleaker` re-exports the `cleaker` namespace parser.
- `monad` exposes `createMonadApp`, `bootstrapMonad`, and `startMonad`.
- `netget` / `NetGet` expose the import-safe NetGet class.
- `GUI` is a lazy facade so importing `all.this` stays safe in Node.

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

The full GUI surfaces (`all.this/gui`, `all.this/gui/molecules`, `all.this/gui/legacy`, and `all.this/gui/devtools`) are browser-facing and may require DOM globals.

## License

MIT
