import type { Metadata } from "next";
import { site } from "../site-data";
import JsonLd from "../components/JsonLd";
import { pageMetadata, siteIdentity } from "../seo";
import "./globals.css";
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
  return <html lang="en" data-product={site.kind}><body><JsonLd data={siteIdentity}/>{children}</body></html>;
}
