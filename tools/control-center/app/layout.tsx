import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { OfflineNotice } from "@/components/OfflineNotice";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gradefruit Workspace",
  description: "Leons persönlicher Workspace für Gradefruit.",
  applicationName: "Gradefruit Workspace",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/workspace-icon.svg" },
  robots: { index: false, follow: false },
};

const themeScript = `
try {
  var savedTheme = localStorage.getItem("gradefruit-workspace-theme") || localStorage.getItem("greatfruit-workspace-theme") || localStorage.getItem("gradefruit-control-center-theme");
  document.documentElement.dataset.theme = savedTheme === "dark" ? "dark" : "light";
} catch (_) {
  document.documentElement.dataset.theme = "light";
}
`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="de" data-theme="light" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body><OfflineNotice /><AppShell>{children}</AppShell></body>
    </html>
  );
}
