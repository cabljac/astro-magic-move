import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, "../public/og.png");

/**
 * Fetch a font file from Google Fonts.
 * Google's CSS API returns a stylesheet containing a real font URL; we parse it out
 * and fetch the binary.
 */
async function loadGoogleFont(family, weight) {
	// Use an old Safari UA so Google returns .ttf instead of .woff2 (satori can't decode woff2)
	const cssUrl = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}`;
	const css = await fetch(cssUrl, {
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A",
		},
	}).then((r) => r.text());

	const match = css.match(/src:\s*url\((https:\/\/[^)]+)\)\s*format\('(?:woff|truetype)'\)/);
	if (!match) throw new Error(`Could not find font URL for ${family} ${weight}`);

	const fontRes = await fetch(match[1]);
	return await fontRes.arrayBuffer();
}

const [jakartaBold, geistMedium] = await Promise.all([
	loadGoogleFont("Plus Jakarta Sans", 600),
	loadGoogleFont("Geist Mono", 500),
]);

// Token colors matching the site's GitHub Dark-style palette
const tokens = {
	keyword: "#d2a8ff",
	string: "#a5d6ff",
	function: "#79c0ff",
	comment: "#484f58",
	text: "#c9d1d9",
	punct: "#8b949e",
};

const codeSnippet = [
	{ t: "<", c: tokens.punct },
	{ t: "MagicMove", c: tokens.function },
	{ t: "\u00A0", c: tokens.text },
	{ t: "before", c: tokens.keyword },
	{ t: "=", c: tokens.punct },
	{ t: "{before}", c: tokens.text },
	{ t: "\u00A0", c: tokens.text },
	{ t: "after", c: tokens.keyword },
	{ t: "=", c: tokens.punct },
	{ t: "{after}", c: tokens.text },
	{ t: "\u00A0", c: tokens.text },
	{ t: "/>", c: tokens.punct },
];

const node = {
	type: "div",
	props: {
		style: {
			width: "100%",
			height: "100%",
			display: "flex",
			flexDirection: "column",
			justifyContent: "space-between",
			padding: "80px",
			backgroundColor: "#09090b",
			backgroundImage:
				"radial-gradient(ellipse 60% 50% at 20% 0%, rgba(139,92,246,0.18), transparent), radial-gradient(ellipse 40% 60% at 90% 100%, rgba(79,160,255,0.1), transparent)",
			fontFamily: "Plus Jakarta Sans",
			color: "#a1a1aa",
		},
		children: [
			// top: label
			{
				type: "div",
				props: {
					style: {
						display: "flex",
						fontFamily: "Geist Mono",
						fontSize: 22,
						letterSpacing: 3,
						textTransform: "uppercase",
						color: "#52525b",
					},
					children: "Astro Component",
				},
			},
			// middle: title + subtitle
			{
				type: "div",
				props: {
					style: {
						display: "flex",
						flexDirection: "column",
						gap: 24,
					},
					children: [
						{
							type: "div",
							props: {
								style: {
									display: "flex",
									fontFamily: "Geist Mono",
									fontSize: 96,
									fontWeight: 500,
									color: "#e4e4e7",
									letterSpacing: -2,
								},
								children: [
									{ type: "span", props: { children: "astro-" } },
									{
										type: "span",
										props: { style: { color: "#a78bfa" }, children: "magic-move" },
									},
								],
							},
						},
						{
							type: "div",
							props: {
								style: {
									display: "flex",
									fontSize: 34,
									color: "#71717a",
									maxWidth: 900,
								},
								children: "Animated code morphing for Astro, built on shiki-magic-move.",
							},
						},
					],
				},
			},
			// bottom: code snippet + url
			{
				type: "div",
				props: {
					style: {
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 40,
					},
					children: [
						{
							type: "div",
							props: {
								style: {
									display: "flex",
									fontFamily: "Geist Mono",
									fontSize: 24,
									padding: "20px 28px",
									backgroundColor: "#0c0c0e",
									border: "1px solid rgba(255,255,255,0.06)",
									borderRadius: 12,
									color: tokens.text,
								},
								children: codeSnippet.map((tok) => ({
									type: "span",
									props: { style: { color: tok.c }, children: tok.t },
								})),
							},
						},
						{
							type: "div",
							props: {
								style: {
									display: "flex",
									fontFamily: "Geist Mono",
									fontSize: 20,
									color: "#52525b",
								},
								children: "github.com/cabljac/astro-magic-move",
							},
						},
					],
				},
			},
		],
	},
};

const svg = await satori(node, {
	width: 1200,
	height: 630,
	fonts: [
		{ name: "Plus Jakarta Sans", data: jakartaBold, weight: 600, style: "normal" },
		{ name: "Geist Mono", data: geistMedium, weight: 500, style: "normal" },
	],
});

const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();

await writeFile(outPath, png);
console.log(`✓ Wrote ${outPath} (${(png.length / 1024).toFixed(1)} KB)`);
