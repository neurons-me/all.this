<img src="https://res.cloudinary.com/dkwnxf6gm/image/upload/v1765903003/all.this_sr55ml.webp" style="zoom:55%;" />

# All.This

A modular **ecosystem** under **this.*** namespace.

## Modules

> Versions below are the pinned versions.

| Module | Install |
|---|---|
| this.gui | `npm i this.gui` |
| this.me | `npm i this.me` |
| this.wallet | `npm i this.wallet` |
| this.img | `npm i this.img` |
| this.audio | `npm i this.audio` |
| this.video | `npm i this.video` |
| this.dom | `npm i this.dom` |
| this.text | `npm i this.text` |
| this.env | `npm i this.env` |
| this.url | `npm i this.url` |
| this.pixel | `npm i this.pixel` |
| this.dictionaries | `npm i this.dictionaries` |
| this.dir | `npm i this.dir` |
| this.document | `npm i this.document` |
| this.blockchain | `npm i this.blockchain` |

## CDN

If you want to test modules in **plain HTML** (no bundler), you can load them from a CDN.

### this.gui (UMD)

```html
<!-- React globals (required for this.gui UMD build) -->
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<!-- this.gui UMD (exposes window.GUI) -->
<script src="https://cdn.jsdelivr.net/npm/this.gui@latest/dist/this.gui.umd.js"></script>
<script>
  console.log('GUI version:', window.GUI?.version);
</script>
```
