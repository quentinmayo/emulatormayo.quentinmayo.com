export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { site } from "../site-data";
export default function sitemap(): MetadataRoute.Sitemap { return [{ url: site.url, changeFrequency: "monthly", priority: 1 }]; }
