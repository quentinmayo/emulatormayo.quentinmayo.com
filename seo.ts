import type { Metadata } from "next";
import { site } from "./site-data";

export function pageMetadata(title: string, description: string, path = "/"): Metadata {
  const url = new URL(path, site.url).href;
  const images = [{ url: "/og.png", width: 1200, height: 630, alt: `${site.name} — ${site.tagline}`, type: "image/png" }];
  return {
    title, description, alternates: { canonical: url },
    openGraph: { title, description, url, siteName: site.name, type: "website", locale: "en_US", images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export const siteIdentity = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": `${site.url}/#website`, name: site.name, url: `${site.url}/`, description: site.description, inLanguage: "en", publisher: { "@id": `${site.url}/#author` } },
    { "@type": "Person", "@id": `${site.url}/#author`, name: "Quentin Mayo", url: "https://github.com/quentinmayo", sameAs: ["https://github.com/quentinmayo", site.supportUrl] },
  ],
};

export function guideSchema(title: string, description: string, path = "/getting-started") {
  const url = `${site.url}${path}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${url}#page`, url, name: title, description, inLanguage: "en", isPartOf: { "@id": `${site.url}/#website` }, breadcrumb: { "@id": `${url}#breadcrumb` } },
      { "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`, itemListElement: [
        { "@type": "ListItem", position: 1, name: site.name, item: `${site.url}/` },
        { "@type": "ListItem", position: 2, name: path === "/steam-deck" ? "Steam Deck" : "Getting started", item: url },
      ] },
    ],
  };
}
