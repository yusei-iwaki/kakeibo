import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  return {
    name: "暮らしのお金",
    short_name: "家計簿",
    description: "カレンダー入力と収支グラフで管理する個人用家計簿",
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    display: "standalone",
    background_color: "#fbf7ef",
    theme_color: "#c77a3d",
    icons: [
      {
        src: `${basePath}/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: `${basePath}/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
