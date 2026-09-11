import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/privacy", "/support", "/join"],
      disallow: [
        "/dashboard",
        "/settings",
        "/memories",
        "/letters",
        "/bucket-list",
        "/playlist",
        "/quiz",
        "/mood",
        "/future",
        "/achievements",
        "/story",
        "/onboarding",
        "/api/",
        "/api/auth",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}