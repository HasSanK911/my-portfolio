import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The analytics page and its endpoints are private. This keeps them out
      // of search results; the password is what actually protects them.
      disallow: ["/views", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
