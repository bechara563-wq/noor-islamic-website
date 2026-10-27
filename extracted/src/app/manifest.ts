import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "نور | Noor",
    short_name: "نور",
    description: "رفيقك اليومي إلى القرآن والذكر — منصة إسلامية مجانية",
    lang: "ar",
    dir: "rtl",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F8F6F0",
    theme_color: "#102A43",
    categories: ["education", "lifestyle", "books"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "96x96 128x128 192x192 256x256 384x384 512x512",
        type: "image/svg+xml",
      },
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
