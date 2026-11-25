import type { MetadataRoute } from "next";
import { WEDDING } from "@/lib/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${WEDDING.title} · Nos photos`,
    short_name: "S & F",
    start_url: "/photo",
    display: "standalone",
    background_color: "#efe8dc",
    theme_color: "#efe8dc",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
