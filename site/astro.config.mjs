// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://wallace.js.org",
  integrations: [
    starlight({
      title: "Wallace",
      customCss: ["./src/styles/custom.css"],
      editLink: {
        baseUrl:
          "https://github.com/wallace-js/wallace-js.github.io/edit/main/",
      },
      sidebar: [
        {
          label: "Main",
          items: [{ slug: "docs" }],
        },
        {
          label: "Guide",
          autogenerate: { directory: "docs/guide" },
        },
        // {
        //   label: "Reference",
        //   autogenerate: { directory: "docs/reference" },
        // },
      ],
    }),
  ],
});
