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
	 * CSS class(es) applied to the outer `<magic-move>` element.
	 * Use this for all visual styling (bg, border, rounded, shadow, padding, width, etc).
	 */
	class?: string;
}
