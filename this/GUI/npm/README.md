# .GUI

###### A collection of components and building blocks enabling GUI generation.
<img src="https://res.cloudinary.com/dkwnxf6gm/image/upload/v1761276578/this.gui.npm.png" alt="This.GUI logo" style="zoom:34%;" />

**Install** via:

```bash
npm install this.gui
```

**Use** as an **exportable React library**:

```ts
import { TopBar } from 'this.gui'
```

**.GUI** provides a rich collection of **atomic** and **composite** **components**  ready to use:

```tsx
import { Button, Card, Text } from 'this.gui';
export function Example() {
  return (
    <Card>
      <Text size="lg" weight="bold">Welcome!</Text>
      <Button onClick={() => alert('Clicked!')}>Click me</Button>
    </Card>
  );
}
```

### Or

```ts
import GUI from 'this.gui';
```

All components are theme-aware and automatically inherit styles and tokens from the `GuiProvider`
<img src="https://res.cloudinary.com/dkwnxf6gm/image/upload/v1761281165/geometry_shapes-removebg-preview_anrdke.png" alt="Geometry shapes" style="zoom:33%;" />

## Initialization
To initialize **This.GUI** in your project, wrap your application with the`GuiProvider` and optionally set a theme:

```tsx
import { GuiProvider } from 'this.gui';
import { Layout } from 'this.gui';

function App() {
  return (
    <GuiProvider theme="dark">
      <Layout>
        <h1>Hello from This.GUI</h1>
      </Layout>
    </GuiProvider>
  );
}

export default App;
```

This structure sets up the reactive theme system, context, and global styles  
needed by all This.GUI components.

---

## Declarative Rendering (Advanced)
Under the hood **This.GUI** ships a resolver registry (`src/registry`) so teams  
can plug a JSON → React renderer into the design system. The npm package does  
**not** expose a ready-made `<RenderGUI />` helper yet; if you want declarative  
rendering you need to wire it yourself:

```tsx
import { GuiRegistry } from 'this.gui/registry';
import type { ResolveCtx } from 'this.gui/registry';

function renderSpec(spec: { type: string; props?: any }, ctx?: ResolveCtx) {
  const entry = GuiRegistry[spec.type];
  if (!entry) throw new Error(`Unknown component type: ${spec.type}`);
  return entry.resolve(spec as any, ctx);
}
```

With that in place you can traverse a schema and render children as you prefer.  
Until an official renderer is published, consume the React components directly  
or build a thin wrapper like the example above.

---

## 🪐 License
MIT © [neurons.me](https://neurons.me)