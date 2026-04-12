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
| `.step` | `number` (get/set) | Current step index. Setting it animates to that step. |
| `.totalSteps` | `number` (get) | Total number of steps. |

The element dispatches a `magic-move:step` event after each transition:

```js
document.querySelector('magic-move')?.addEventListener('magic-move:step', (e) => {
  console.log(`Step ${e.detail.step + 1} of ${e.detail.total}`)
})
```

## License

MIT
