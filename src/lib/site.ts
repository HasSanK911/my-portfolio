import { profile } from "./data";

/**
 * Set NEXT_PUBLIC_SITE_URL in the deployment environment. It drives
 * `metadataBase`, canonical URLs, the sitemap and JSON-LD — leaving it at the
 * localhost fallback in production yields broken absolute URLs.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const site = {
  url: siteUrl,
  name: `${profile.fullName} — ${profile.role}`,
  shortName: profile.fullName,
  title: `${profile.fullName} — Frontend Developer`,
  description:
    "Frontend developer specialising in Angular, React and Next.js. Four years and 30+ projects shipped — web applications, progressive web apps and enterprise admin dashboards for startups and established companies.",
  keywords: [
    "Frontend Developer",
    "Angular Developer",
    "React Developer",
    "Next.js Developer",
    "TypeScript",
    "Tailwind CSS",
    "Web Developer Pakistan",
    "Ali Hassan Kaleemi",
  ],
  locale: "en_GB",
  /** Drop a 1200x630 image at this path in /public to enable rich previews. */
  ogImage: "/images/og-image.png",
} as const;

/** Person schema consumed by search engines for the knowledge panel. */
export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.fullName,
    jobTitle: profile.role,
    email: `mailto:${profile.email}`,
    telephone: profile.phone,
    url: siteUrl,
    description: site.description,
    knowsLanguage: profile.languages,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Swabi",
      addressCountry: "PK",
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "University of Swabi",
    },
    knowsAbout: [
      "Angular",
      "React.js",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Laravel",
      "Front-end architecture",
    ],
  };
}
