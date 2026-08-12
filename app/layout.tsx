import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0a0b0d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "gamedayhuddle.com";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  const base = new URL(`${protocol}://${host}`);
  return {
    metadataBase: base,
    title: { default: "GameDay Huddle", template: "%s | GameDay Huddle" },
    description: "Football playbook, game-day play calling, staff collaboration, and team analytics for Android.",
    applicationName: "GameDay Huddle",
    keywords: ["football coaching app", "football playbook app", "football analytics", "game day play calling", "football team management"],
    icons: { icon: "/app-icon.png", apple: "/app-icon.png" },
    openGraph: {
      type: "website",
      siteName: "GameDay Huddle",
      title: "GameDay Huddle — Build the playbook. Call it on game day.",
      description: "The sideline operating system for football coaches and programs.",
      images: [{ url: new URL("/og.png", base).toString(), width: 1731, height: 909, alt: "GameDay Huddle — Build the playbook. Call it on game day." }],
    },
    twitter: { card: "summary_large_image", title: "GameDay Huddle", description: "Build the playbook. Call it on game day.", images: [new URL("/og.png", base).toString()] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to content</a><div id="main-content">{children}</div></body></html>;
}
