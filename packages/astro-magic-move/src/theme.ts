import { createCssVariablesTheme } from "shiki/core";

/**
 * A shared CSS-variables theme. Colors are driven by `--shiki-*` custom
 * properties. Sensible defaults are provided so the component looks good
 * out of the box — consumers override as many or as few as they want.
 */
export const cssVarTheme = createCssVariablesTheme({
	name: "css-variables",
	variablePrefix: "--shiki-",
	variableDefaults: {
		foreground: "#d4d4d4",
		background: "#1e1e1e",
		"token-keyword": "#c586c0",
		"token-string": "#ce9178",
		"token-function": "#dcdcaa",
		"token-comment": "#6a9955",
		"token-constant": "#4fc1ff",
		"token-parameter": "#9cdcfe",
		"token-punctuation": "#d4d4d4",
		"token-string-expression": "#ce9178",
		"token-link": "#4fc1ff",
	},
	fontStyle: true,
});
