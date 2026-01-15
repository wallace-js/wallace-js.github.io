// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://wallace.js.org",
  integrations: [
    starlight({
      title: "Wallace",
      customCss: ["./src/styles/custom.css"],
    }),
  ],
});
