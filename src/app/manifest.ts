import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "暮らしのお金",
    short_name: "家計簿",
    description: "カレンダー入力と収支グラフで管理する個人用家計簿",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fbf7ef",
    theme_color: "#c77a3d",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
