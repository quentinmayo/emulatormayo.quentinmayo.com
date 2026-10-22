import type { Metadata } from "next";
import { site } from "../site-data";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(site.url), title: `${site.name} — ${site.tagline}`,
  description: site.description,
  openGraph: { title: `${site.name} — ${site.tagline}`, description: site.description, url: site.url, siteName: site.name, type: "website", images: [{ url: "/og.svg", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: site.name, description: site.description },
  robots: { index: true, follow: true }, alternates: { canonical: "/" }, icons: { icon: "/icon.svg" }
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en" data-product={site.kind}><body>{children}</body></html>;
}
