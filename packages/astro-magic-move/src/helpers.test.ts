import { describe, expect, test } from "vitest";
import { normalizeEOL, region, slice } from "./helpers";

const SRC = ["line1", "line2", "line3", "line4", "line5"].join("\n");

describe("normalizeEOL", () => {
	test("converts CRLF to LF", () => {
		expect(normalizeEOL("a\r\nb\r\nc")).toBe("a\nb\nc");
	});

	test("leaves LF-only input untouched", () => {
		expect(normalizeEOL("a\nb\nc")).toBe("a\nb\nc");
	});
});

describe("slice", () => {
	test("omitted `to` runs through end of source", () => {
		expect(slice(SRC, 3)).toBe("line3\nline4\nline5");
	});

	test("inclusive range lines 2-3", () => {
		expect(slice(SRC, 2, 3)).toBe("line2\nline3");
	});

	test("single line when from === to", () => {
		expect(slice(SRC, 4, 4)).toBe("line4");
	});

	test("negative `from` counts from the end", () => {
		expect(slice(SRC, -2)).toBe("line4\nline5");
	});

	test("negative `from` and explicit `to`", () => {
		expect(slice(SRC, -3, -2)).toBe("line3\nline4");
	});

	test("whole source when from=1 and no `to`", () => {
		expect(slice(SRC, 1)).toBe(SRC);
	});

	test("normalizes CRLF before slicing", () => {
		const crlf = "a\r\nb\r\nc\r\nd";
		expect(slice(crlf, 2, 3)).toBe("b\nc");
	});

	test("throws when from > to", () => {
		expect(() => slice(SRC, 5, 3)).toThrow(/past/);
	});

	test("throws when from is out of range", () => {
		expect(() => slice(SRC, 99)).toThrow(/out of range/);
	});

	test("throws when to is out of range", () => {
		expect(() => slice(SRC, 1, 99)).toThrow(/out of range/);
	});

	test("throws when negative from resolves below 1", () => {
		expect(() => slice(SRC, -99)).toThrow(/out of range/);
	});
});

describe("region", () => {
	test("extracts a line-comment-marked region and strips markers", () => {
		const src = ["before", "// #region foo", "inside1", "inside2", "// #endregion", "after"].join(
			"\n",
		);
		expect(region(src, "foo")).toBe("inside1\ninside2");
	});

	test("supports named #endregion", () => {
		const src = ["// #region foo", "x", "// #endregion foo"].join("\n");
		expect(region(src, "foo")).toBe("x");
	});

	test("extracts a block-comment-marked region", () => {
		const src = ["before", "/* #region bar */", "inside", "/* #endregion */", "after"].join("\n");
		expect(region(src, "bar")).toBe("inside");
	});

	test("de-indents by the minimum common leading whitespace", () => {
		const src = [
			"    // #region foo",
			"    const x = 1;",
			"      const y = 2;",
			"    // #endregion",
		].join("\n");
		expect(region(src, "foo")).toBe("const x = 1;\n  const y = 2;");
	});

	test("preserves tab indentation verbatim", () => {
		const src = ["\t// #region foo", "\tconst x = 1;", "\t\tconst y = 2;", "\t// #endregion"].join(
			"\n",
		);
		expect(region(src, "foo")).toBe("const x = 1;\n\tconst y = 2;");
	});

	test("ignores blank lines when computing indent", () => {
		const src = [
			"    // #region foo",
			"    const x = 1;",
			"",
			"    const y = 2;",
			"    // #endregion",
		].join("\n");
		expect(region(src, "foo")).toBe("const x = 1;\n\nconst y = 2;");
	});

	test("handles first body line more indented than later lines", () => {
		const src = [
			"  // #region foo",
			"      deep();", // 6 spaces
			"  shallow();", // 2 spaces — this sets the common min
			"  // #endregion",
		].join("\n");
		expect(region(src, "foo")).toBe("    deep();\nshallow();");
	});

	test("picks the right region when multiple siblings exist", () => {
		const src = [
			"// #region a",
			"aaa",
			"// #endregion",
			"// #region b",
			"bbb",
			"// #endregion",
		].join("\n");
		expect(region(src, "b")).toBe("bbb");
	});

	test("does NOT close on a nested #endregion (depth counting)", () => {
		const src = [
			"// #region outer",
			"outer-a",
			"// #region inner",
			"inner-body",
			"// #endregion",
			"outer-b",
			"// #endregion",
		].join("\n");
		expect(region(src, "outer")).toBe("outer-a\ninner-body\nouter-b");
	});

	test("strips inner region markers from the extracted output", () => {
		const src = [
			"// #region outer",
			"// #region inner",
			"x",
			"// #endregion",
			"// #endregion",
		].join("\n");
		const result = region(src, "outer");
		expect(result).not.toMatch(/#region/);
		expect(result).not.toMatch(/#endregion/);
		expect(result).toBe("x");
	});

	test("normalizes CRLF before matching", () => {
		const src = ["// #region foo", "body", "// #endregion"].join("\r\n");
		expect(region(src, "foo")).toBe("body");
	});

	test("throws descriptively when region is missing", () => {
		expect(() => region("no regions here", "setup")).toThrow(
			/\[astro-magic-move\] region "setup" not found/,
		);
	});

	test("throws when #endregion is missing", () => {
		const src = ["// #region foo", "body"].join("\n");
		expect(() => region(src, "foo")).toThrow(/no matching #endregion/);
	});

	test("only matches #region with exact name (no prefix collisions)", () => {
		const src = [
			"// #region foobar",
			"wrong",
			"// #endregion",
			"// #region foo",
			"right",
			"// #endregion",
		].join("\n");
		expect(region(src, "foo")).toBe("right");
	});
});
