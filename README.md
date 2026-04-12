# astro-magic-move

Animated code morphing for Astro, powered by [Shiki Magic Move](https://github.com/shikijs/shiki-magic-move).

- **Build-time tokenization** — all Shiki highlighting runs in Astro's frontmatter. Zero Shiki JS ships to the client.
- **Vanilla custom element** — the animation is powered by `MagicMoveRenderer` (~4kb), no framework islands needed.
- **CSS-variable theming** — token colors come from `--shiki-*` custom properties. Works with Tailwind, daisyUI, plain CSS, whatever.

[Demo & docs](https://astro-magic-move.dev)

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
```

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
| `trigger` | `'scroll' \| 'click' \| 'auto'` | `'scroll'` | How the animation fires |
| `duration` | `number` | `800` | Animation duration in ms |
| `stagger` | `number` | `0.3` | Token entrance stagger |
| `threshold` | `number` | `0.4` | IntersectionObserver threshold (scroll only) |
| `lineNumbers` | `boolean` | `false` | Show line numbers |
| `class` | `string` | — | CSS classes on outer element |

## Events

The custom element dispatches a `magic-move:step` event after each transition:

```js
document.querySelector('magic-move')?.addEventListener('magic-move:step', (e) => {
  console.log(`Step ${e.detail.step + 1} of ${e.detail.total}`)
})
```

## License

MIT
