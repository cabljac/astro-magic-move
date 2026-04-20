export interface MagicMoveProps {
	/** Code for the initial state. Shorthand for two-step usage. */
	before?: string;

	/** Code for the final state. Shorthand for two-step usage. */
	after?: string;

	/**
	 * Array of code strings for multi-step morphing.
	 * Takes precedence over before/after if provided.
	 * Must contain at least 2 items.
	 */
	steps?: string[];

	/** Language for syntax highlighting. Default: `'typescript'` */
	lang?: string;

	/**
	 * How the animation is triggered:
	 * - `'scroll'`: animate when element enters viewport (default)
	 * - `'click'`: toggle forward on click, wraps around
	 * - `'auto'`: animate immediately when the element mounts
	 * - `'none'`: no built-in trigger; control steps externally via the element's `step` property
	 */
	trigger?: "scroll" | "click" | "auto" | "none";

	/** Animation duration in ms. Default: `800` */
	duration?: number;

	/** Stagger delay for token entrance. Default: `0.3` */
	stagger?: number;

	/**
	 * IntersectionObserver threshold (0–1). Only used when trigger='scroll'.
	 * Default: `0.4`
	 */
	threshold?: number;

	/** Whether to animate line numbers. Default: `false` */
	lineNumbers?: boolean;

	/**
	 * Minimum height expressed as a number of lines.
	 * Prevents layout shift when stepping between code blocks of different lengths.
	 */
	minLines?: number;

	/**
	 * CSS class(es) applied to the outer `<magic-move>` element.
	 * Use this for all visual styling (bg, border, rounded, shadow, padding, width, etc).
	 */
	class?: string;
}

/**
 * Public shape of the `<magic-move>` custom element. Use with
 * `document.querySelector('magic-move')` — the tag-name map augmentation
 * below makes the cast automatic.
 */
export interface MagicMoveElement extends HTMLElement {
	/** Current step index. Setting it animates to that step. Writes before `isReady` are queued. */
	step: number;
	/** Total number of steps. Returns 0 until the element is ready. */
	readonly totalSteps: number;
	/** True once the element has hydrated and is safe to drive. */
	readonly isReady: boolean;
}

/** Dispatched after each transition. `detail.step` is the new index; `detail.total` is `totalSteps`. */
export type MagicMoveStepEvent = CustomEvent<{ step: number; total: number }>;

/** Dispatched once, after hydration, when `.step` / `.totalSteps` are safe to use. */
export type MagicMoveReadyEvent = CustomEvent;

declare global {
	interface HTMLElementTagNameMap {
		"magic-move": MagicMoveElement;
	}
	interface HTMLElementEventMap {
		"magic-move:ready": MagicMoveReadyEvent;
		"magic-move:step": MagicMoveStepEvent;
	}
}
