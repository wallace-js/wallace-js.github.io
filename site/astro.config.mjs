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
      social: [
        {
          icon: "discord",
          label: "Discord",
          href: "https://discord.com/channels/1463508954285084775/1463508955425669246",
        },
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/wallace-js/wallace",
        },
      ],
      sidebar: [
        {
          label: "Main",
          items: [{ slug: "docs" }],
        },
        {
          label: "Guide",
          autogenerate: { directory: "docs/guide" },
        },
        {
          label: "Reference",
          autogenerate: { directory: "docs/reference" },
        },
      ],
    }),
  ],
});
