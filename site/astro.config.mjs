// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  site: "https://wallace-js.github.io",
  // base: "/wallace/",
  // trailingSlash: "ignore",
  integrations: [
    starlight({
      title: "Wallace",
    }),
  ],
});
