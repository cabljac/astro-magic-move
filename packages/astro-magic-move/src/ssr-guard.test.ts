import { describe, expect, test } from "vitest";

/**
 * Guard regression: the custom-element registration inside MagicMove.astro's
 * `<script>` block must not throw when evaluated in an environment without DOM
 * globals. This simulates the scenario where Astro's script hoisting leaks the
 * block into the SSR module graph (a known seam with node_modules `.astro`
 * files and MDX-rendered components).
 */
describe("SSR guard on the custom-element script", () => {
	test("the guard pattern doesn't throw in a non-DOM environment", () => {
		// vitest runs in Node — HTMLElement and customElements are undefined.
		expect(typeof HTMLElement).toBe("undefined");
		expect(typeof customElements).toBe("undefined");

		// Mirror of the guard wrapping the class + registration in MagicMove.astro.
		// If this block threw, it would abort the render during SSR.
		expect(() => {
			if (typeof HTMLElement !== "undefined" && typeof customElements !== "undefined") {
				class _StubElement extends HTMLElement {}
				if (!customElements.get("stub-el")) {
					customElements.define("stub-el", _StubElement);
				}
			}
		}).not.toThrow();
	});

	test("without the guard, `class extends HTMLElement` throws in Node", () => {
		expect(() => {
			new Function("class X extends HTMLElement {}")();
		}).toThrow(/HTMLElement/);
	});
});
