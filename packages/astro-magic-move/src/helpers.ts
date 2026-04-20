/**
 * Normalize Windows `\r\n` line endings to `\n`.
 * Both helpers normalize their input before matching.
 */
export function normalizeEOL(source: string): string {
	return source.replace(/\r\n/g, "\n");
}

/**
 * Extract a contiguous 1-indexed line range from a source string.
 *
 * Both `from` and `to` are inclusive and match editor gutter numbering
 * (lines 10–17 means 10 through 17). Negative indices count from the end
 * (`slice(src, -5)` → last 5 lines). Omitted `to` defaults to the last line.
 * Does not de-indent — use `region` when you want the inside of a block.
 *
 * Throws on invalid ranges (build-time failure is preferable to a silently
 * blank animation shipped to prod).
 */
export function slice(source: string, from: number, to?: number): string {
	const lines = normalizeEOL(source).split("\n");
	const n = lines.length;

	const resolve = (i: number): number => (i < 0 ? n + i + 1 : i);
	const start = resolve(from);
	const end = to === undefined ? n : resolve(to);

	if (!Number.isFinite(start) || !Number.isFinite(end)) {
		throw new Error(`[astro-magic-move] slice: non-finite line index`);
	}
	if (start < 1 || start > n) {
		throw new Error(
			`[astro-magic-move] slice: "from" (${from}) out of range for source with ${n} lines`,
		);
	}
	if (end < 1 || end > n) {
		throw new Error(
			`[astro-magic-move] slice: "to" (${to}) out of range for source with ${n} lines`,
		);
	}
	if (start > end) {
		throw new Error(`[astro-magic-move] slice: "from" (${from}) is past "to" (${to})`);
	}

	return lines.slice(start - 1, end).join("\n");
}

/**
 * Extract a named region from source, delimited by `#region name` / `#endregion`
 * markers. Supports both line-comment (`// #region foo`) and block-comment
 * (`/* #region foo *\/`) styles, covering JS/TS/Astro scripts, CSS, and most
 * C-family languages.
 *
 * Markers are depth-counted so a nested `#region` inside doesn't close the
 * outer region prematurely; all marker lines (outer and inner) are stripped
 * from the output. The remaining body is de-indented by its minimum common
 * leading whitespace (tabs and spaces preserved verbatim — no normalization).
 *
 * Note: VS Code's default region folding allows unnamed `// #region` markers.
 * This helper requires a name on the opening marker so you can target a
 * specific block. Unnamed regions are ignored when picking an extraction
 * target but still participate in depth counting.
 *
 * Throws if the region is not found or has no matching `#endregion`. Runs in
 * Astro frontmatter, so a missing region fails the build with a clear error.
 */
export function region(source: string, name: string): string {
	const lines = normalizeEOL(source).split("\n");

	const startRe = new RegExp(`^\\s*(?://|/\\*)\\s*#region\\s+${escapeRegex(name)}\\b`);
	const anyRegionRe = /^\s*(?:\/\/|\/\*)\s*#region\b/;
	const anyEndRe = /^\s*(?:\/\/|\/\*)\s*#endregion\b/;

	let startIdx = -1;
	for (let i = 0; i < lines.length; i++) {
		if (startRe.test(lines[i])) {
			startIdx = i;
			break;
		}
	}
	if (startIdx === -1) {
		throw new Error(`[astro-magic-move] region "${name}" not found`);
	}

	let depth = 1;
	let endIdx = -1;
	for (let i = startIdx + 1; i < lines.length; i++) {
		if (anyRegionRe.test(lines[i])) depth++;
		else if (anyEndRe.test(lines[i])) {
			depth--;
			if (depth === 0) {
				endIdx = i;
				break;
			}
		}
	}
	if (endIdx === -1) {
		throw new Error(`[astro-magic-move] region "${name}" has no matching #endregion`);
	}

	const body = lines
		.slice(startIdx + 1, endIdx)
		.filter((line) => !anyRegionRe.test(line) && !anyEndRe.test(line));

	let minIndent = Infinity;
	for (const line of body) {
		if (line.trim() === "") continue;
		const match = line.match(/^[\t ]*/);
		const len = match ? match[0].length : 0;
		if (len < minIndent) minIndent = len;
	}
	if (!Number.isFinite(minIndent)) minIndent = 0;

	return body.map((line) => line.slice(minIndent)).join("\n");
}

function escapeRegex(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
