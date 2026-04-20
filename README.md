# astro-magic-move

Animated code morphing for Astro, powered by [Shiki Magic Move](https://github.com/shikijs/shiki-magic-move).

- **Zero-config precompilation** — tokenization runs in Astro's frontmatter at build time. No highlighter ships to the client.
- **Built-in triggers** — scroll into view, click to advance, or auto-play on mount. No wiring required.
- **CSS-variable theming** — token colors come from `--shiki-*` custom properties instead of inline styles. Works with Tailwind, daisyUI, plain CSS, whatever.
- **Tiny client footprint** — only the `MagicMoveRenderer` (~4 kB) runs in the browser.

[Demo & docs](https://astro-magic-move.dev)

## How is this different from shiki-magic-move?

I loved the [shiki-magic-move](https://github.com/shikijs/shiki-magic-move) package, and wanted to make it easier to add into Astro projects.

shiki-magic-move provides the core diffing engine, renderer, and framework components (React, Vue, Svelte, Solid, web components) that power the animation. It also supports a precompiled path where you tokenize at build time and ship only the renderer to the client.

**astro-magic-move** builds on top of that. Instead of manually creating a highlighter, running `createMagicMoveMachine`, serializing tokens, and writing a client-side consumer, you pass code strings as props and the component handles everything:

```astro
<MagicMove before={a} after={b} trigger="scroll" />
```

On top of the DX simplification, it adds two features not present in shiki-magic-move:

- **Trigger modes** (`scroll`, `click`, `auto`) — shiki-magic-move leaves it to you to decide when transitions fire. This component has them built in.
- **CSS-variable theming by default** — shiki-magic-move applies token colors as inline styles. This component uses Shiki's `css-variables` theme so you can control all syntax colors with `--shiki-*` custom properties.

## Install

```bash
pnpm add astro-magic-move
```

Import the base styles once (e.g. in a layout):

```astro
---
import 'astro-magic-move/styles'
---
```

## Usage

### Before / After

```astro
---
import { MagicMove } from 'astro-magic-move'

const before = `const data = fetch('/api')`
const after = `const data = await fetch('/api')
const json = await data.json()`
---

<MagicMove
  before={before}
  after={after}
  lang="typescript"
  trigger="click"
/>
```

### Multi-step

```astro
---
import { MagicMove } from 'astro-magic-move'

const steps = [
  `const x = 1`,
  `const x = 1
console.log(x)`,
  `function log(val: number) {
  console.log(val)
}
log(1)`,
]
---

<MagicMove
  steps={steps}
  lang="typescript"
  trigger="click"
/>
```

### Trigger modes

```astro
<!-- Auto-play on mount -->
<MagicMove before={a} after={b} trigger="auto" />

<!-- Click to advance steps -->
<MagicMove steps={steps} trigger="click" />

<!-- Scroll into viewport -->
<MagicMove before={a} after={b} trigger="scroll" />

<!-- No built-in trigger -->
<MagicMove steps={steps} trigger="none" />
```

### External control

Use `trigger="none"` and drive steps from your own code:

```astro
<MagicMove id="demo" steps={steps} lang="typescript" trigger="none" />

<button id="prev">Prev</button>
<button id="next">Next</button>

<script>
  const el = document.querySelector('#demo')
  document.getElementById('next').addEventListener('click', () => {
    el.step = Math.min(el.step + 1, el.totalSteps - 1)
  })
  document.getElementById('prev').addEventListener('click', () => {
    el.step = Math.max(el.step - 1, 0)
  })
</script>
```

The `step` setter animates to the given index. Read `el.step` for the current position and `el.totalSteps` for the count. External control also works alongside built-in triggers.

#### Waiting for the element to be ready

The component's script is bundled as a deferred module, so the custom element isn't defined — and `.totalSteps` / `.isReady` aren't meaningful — the instant the HTML is parsed. Wait for the class to be registered, then either check `isReady` or listen for `magic-move:ready`:

```js
customElements.whenDefined('magic-move').then(() => {
  const el = document.querySelector('magic-move')
  if (el.isReady) init()
  else el.addEventListener('magic-move:ready', init, { once: true })
})

function init() {
  // safe to read .totalSteps and write .step
}
```

`whenDefined(...).then(...)` works from both module and inline (`is:inline`) scripts. Calls to `el.step = N` before the element is ready are queued and applied on ready, so simple "jump to step on load" use cases work without waiting.

### Loading code from real source files

Template literals in frontmatter drift from the real source — if you refactor the file, the animation silently lies. Use Vite's `?raw` import to read the real file, then pair with the `slice` / `region` helpers:

```astro
---
import { MagicMove } from 'astro-magic-move';
import { slice, region } from 'astro-magic-move/helpers';
import gen from '../src/generate.ts?raw';
---

<!-- explicit line range, 1-indexed inclusive -->
<MagicMove steps={[
  slice(gen, 10, 17),
  slice(gen, 10, 23),
  slice(gen, 10, 30),
]} lang="ts" trigger="click" />
```

For refactor-safe ranges, mark regions in the source with VS Code's standard `#region` comments (named — plain unnamed `// #region` is ignored):

```ts
// generate.ts
// #region v1-schema
const spec = Schema.parse(output);
// #endregion

// #region v2-structural
const spec = Schema.parse(output);
assertUniqueIds(spec);
// #endregion
```

```astro
<MagicMove steps={[
  region(gen, 'v1-schema'),
  region(gen, 'v2-structural'),
]} lang="ts" trigger="click" />
```

`region` strips marker lines and de-indents by the minimum common indent, so a block extracted from inside a function renders flush-left. Both helpers throw at build time on missing names or out-of-range indices — a missing region fails the build with a clear error rather than shipping a blank animation.

`?raw` imports resolve the file via Vite, so project-relative paths, TS path aliases, and workspace imports all work. Files outside the Astro project root need `server.fs.allow` configured in `astro.config.mjs`.

Nested `#region` markers of any name are depth-counted (an inner `#endregion` won't close the outer region) and stripped from the output. VS Code also folds unnamed `// #region`; those are ignored by `region()` since extraction needs a name to target.

## Theming

Define `--shiki-*` CSS custom properties to control syntax colors:

```css
:root {
  --shiki-foreground: #d4d4d4;
  --shiki-background: #1e1e1e;
  --shiki-token-keyword: #c586c0;
  --shiki-token-string: #ce9178;
  --shiki-token-function: #dcdcaa;
  --shiki-token-comment: #6a9955;
}
```

Sensible defaults are built in — the component works without defining any variables.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `before` | `string` | — | Code for initial state (two-step shorthand) |
| `after` | `string` | — | Code for final state (two-step shorthand) |
| `steps` | `string[]` | — | Array of code strings (min 2) |
| `lang` | `string` | `'typescript'` | Shiki language grammar |
| `trigger` | `'scroll' \| 'click' \| 'auto' \| 'none'` | `'scroll'` | How the animation fires |
| `duration` | `number` | `800` | Animation duration in ms |
| `stagger` | `number` | `0.3` | Token entrance stagger |
| `threshold` | `number` | `0.4` | IntersectionObserver threshold (scroll only) |
| `lineNumbers` | `boolean` | `false` | Show line numbers |
| `class` | `string` | — | CSS classes on outer element |

## DOM API

The `<magic-move>` custom element exposes these properties for external control:

| Property | Type | Description |
|----------|------|-------------|
| `.step` | `number` (get/set) | Current step index. Setting it animates to that step. Writes before `isReady` are queued and applied on ready. |
| `.totalSteps` | `number` (get) | Total number of steps. Returns `0` until the element is ready. |
| `.isReady` | `boolean` (get) | `true` once the element has hydrated. |

The element dispatches two events:

- `magic-move:ready` — fires once, after hydration, when `.step` / `.totalSteps` are safe to use.
- `magic-move:step` — fires after each transition with `{ step, total }` detail.

```js
document.querySelector('magic-move')?.addEventListener('magic-move:step', (e) => {
  console.log(`Step ${e.detail.step + 1} of ${e.detail.total}`)
})
```

### TypeScript

Importing from `astro-magic-move` augments `HTMLElementTagNameMap` and `HTMLElementEventMap`, so the DOM API is typed with no casts or generic parameters:

```ts
import 'astro-magic-move';

const el = document.querySelector('magic-move');
if (el) {
  el.step = 2;                         // typed number setter
  const n: number = el.totalSteps;     // typed
  el.addEventListener('magic-move:step', (e) => {
    e.detail.step;                      // typed as number
    e.detail.total;                     // typed as number
  });
}
```

For consumers who want to reference the types explicitly: `MagicMoveElement`, `MagicMoveStepEvent`, and `MagicMoveReadyEvent` are exported from the package root.

## License

MIT
