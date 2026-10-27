// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// User site — served from the root of londo.me, so no `base`.
export default defineConfig({
  site: "https://londo.me",
  integrations: [sitemap()],
  // the API's version root has no file of its own; send people to the docs
  redirects: { "/api/v1": "/api/" },
});
