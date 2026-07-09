// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// User site — served from the root of londopy.github.io, so no `base`.
export default defineConfig({
  site: "https://londopy.github.io",
  integrations: [sitemap()],
});
