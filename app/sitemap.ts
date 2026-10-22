export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { site } from "../site-data";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site.url}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/steam-deck`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/getting-started`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
