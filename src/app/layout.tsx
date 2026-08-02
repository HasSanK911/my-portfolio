import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { Preloader } from "@/components/layout/preloader";
import { Cursor } from "@/components/layout/cursor";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { personJsonLd, site, siteUrl } from "@/lib/site";
import { publicAsset } from "@/lib/assets";

/* --------------------------------------------------------------- typefaces */

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

/* ---------------------------------------------------------------- metadata */

// Only advertise a social preview once the file actually exists — an OG tag
// pointing at a 404 is worse than no OG tag at all.
const ogImage = publicAsset(site.ogImage);

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: site.title,
    template: `%s — ${site.shortName}`,
  },
  description: site.description,
  keywords: [...site.keywords],
  authors: [{ name: site.shortName, url: siteUrl }],
  creator: site.shortName,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: siteUrl,
    siteName: site.name,
    title: site.title,
    description: site.description,
    ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: site.name }] } : {}),
  },
  twitter: {
    card: ogImage ? "summary_large_image" : "summary",
    title: site.title,
    description: site.description,
    ...(ogImage ? { images: [ogImage] } : {}),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  // User scaling is never disabled — pinch zoom is an accessibility necessity.
  width: "device-width",
  initialScale: 1,
  // The site ships dark regardless of OS preference, so the browser chrome is
  // pinned to the dark surface rather than keyed off prefers-color-scheme.
  themeColor: "#08080a",
};

/* ------------------------------------------------------------------ layout */

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // `dark` is set server-side so the default holds even before (or without)
    // the theme script; next-themes swaps it if a light preference is stored.
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${geist.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body className="grain antialiased">
        {/* enableSystem is off on purpose — dark is the intended default for
            every visitor; the toggle is the only thing that changes it. */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-brand focus:px-5 focus:py-3 focus:text-sm focus:text-white"
          >
            Skip to content
          </a>

          <Preloader />
          <SmoothScroll />
          <Cursor />
          <Nav />

          <main id="main" className="relative z-10">
            {children}
          </main>

          <Footer />
        </ThemeProvider>

        <script
          type="application/ld+json"
          // Serialised from a typed object we control — no user input involved.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }}
        />
      </body>
    </html>
  );
}
