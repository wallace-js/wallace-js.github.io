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
        // A single link item labelled “Home”.
        // { label: "Home", link: "/" },
        // A group labelled “Start Here” containing four links.
        {
          label: "Start Here",
          items: [
            // Using `slug` for internal links.
            { slug: "docs" },
            // { slug: "installation" },
            // Or using the shorthand for internal links.
            // "tutorial",
            // "next-steps",
          ],
        },
        // A group linking to all pages in the reference directory.
        {
          label: "Reference",
          autogenerate: { directory: "docs/reference" },
        },
      ],
    }),
  ],
});
