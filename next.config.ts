import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Apple sucht die Datei für die Domain-Verknüpfung ausschließlich unter
  // diesem Pfad, ohne Dateiendung und mit `application/json` als Typ. Ordner,
  // die mit einem Punkt beginnen, liefert der Datei-Router nicht aus — deshalb
  // der Umweg über eine Route.
  async rewrites() {
    return [
      {
        source: '/.well-known/apple-app-site-association',
        destination: '/api/apple-app-site-association',
      },
    ];
  },
};

export default nextConfig;
