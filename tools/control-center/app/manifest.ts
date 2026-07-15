import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gradefruit Workspace",
    short_name: "Gradefruit",
    description: "Leons privater Arbeitsbereich für Gradefruit.",
    start_url: "/overview",
    display: "standalone",
    background_color: "#f7f7f6",
    theme_color: "#171716",
    icons: [{ src: "/workspace-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
