import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
	adapter: cloudflare({
		prerenderEnvironment: "node",
		imageService: "passthrough",
	}),
	output: "server",
	vite: {
		plugins: [tailwindcss()],
	},
});
