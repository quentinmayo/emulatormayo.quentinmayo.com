import type { Metadata, Viewport } from "next";
import { site } from "../site-data";
import JsonLd from "../components/JsonLd";
import Appearance from "../components/Appearance";
import { pageMetadata, siteIdentity } from "../seo";
import "./globals.css";
export const viewport: Viewport = { themeColor: "#091610", colorScheme: "dark" };
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  ...pageMetadata(site.seoTitle, site.description),
  applicationName: site.name,
  authors: [{ name: "Quentin Mayo", url: "https://github.com/quentinmayo" }],
  creator: "Quentin Mayo",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  icons: { icon: "/icon.svg" }
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en" data-product={site.kind}><body><Appearance brand="emulatormayo"/><JsonLd data={siteIdentity}/>{children}</body></html>;
}
