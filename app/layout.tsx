import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/inter";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#06193d",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

const description =
  "Registration, document management, team messaging, fundraising and equipment for youth football and cheer organizations — in one app.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "gamedayhuddle.com";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  const base = new URL(`${protocol}://${host}`);
  return {
    metadataBase: base,
    title: { default: "GameDay Huddle", template: "%s | GameDay Huddle" },
    description,
    applicationName: "GameDay Huddle",
    keywords: ["youth football registration", "youth football app", "cheer registration", "team messaging", "youth sports fundraising", "equipment management"],
    icons: {
      icon: [{ url: "/icon.png", type: "image/png", sizes: "256x256" }],
      apple: "/apple-icon.png",
    },
    openGraph: {
      type: "website",
      siteName: "GameDay Huddle",
      title: "GameDay Huddle — Run your football organization. Not ten different apps.",
      description,
      images: [{ url: new URL("/og.png", base).toString(), width: 1200, height: 630, alt: "GameDay Huddle — Run your football organization. Not ten different apps." }],
    },
    twitter: { card: "summary_large_image", title: "GameDay Huddle", description, images: [new URL("/og.png", base).toString()] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to content</a><div id="main-content">{children}</div></body></html>;
}
