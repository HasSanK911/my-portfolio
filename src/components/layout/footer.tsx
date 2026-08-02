import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { navLinks, profile } from "@/lib/data";
import { Marquee } from "@/components/ui/marquee";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-line bg-bg">
      <div className="border-b border-line py-8">
        <Marquee
          items={["Available for work", "Angular", "React", "Next.js", "Remote or relocation"]}
          duration={40}
          className="text-title text-fg-subtle/70"
        />
      </div>

      <div className="shell grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-xs font-bold text-white">
              AH
            </span>
            <span className="font-semibold tracking-tight">{profile.fullName}</span>
          </Link>
          <p className="text-lead max-w-xs !text-[0.9375rem]">{profile.tagline}</p>
          <p className="text-mono-sm text-fg-subtle">
            {profile.location} · {profile.timezone}
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="text-label mb-5 text-fg-subtle">Navigate</h2>
          <ul className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <li key={link.id}>
                <Link
                  href={`/${link.href}`}
                  className="text-sm text-fg-muted transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-label mb-5 text-fg-subtle">Elsewhere</h2>
          <ul className="flex flex-col gap-3">
            {profile.socials.map((social) => {
              const isProtocol = social.href.startsWith("mailto:") || social.href.startsWith("tel:");
              return (
                <li key={social.label}>
                  <a
                    href={social.href}
                    {...(isProtocol ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                    className="group inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-accent"
                  >
                    {social.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="shell flex flex-col items-start justify-between gap-3 border-t border-line py-7 sm:flex-row sm:items-center">
        <p className="text-mono-sm text-fg-subtle">
          &copy; {year} {profile.fullName}. All rights reserved.
        </p>
        <p className="text-mono-sm text-fg-subtle">
          Built with Next.js, Three.js &amp; Framer Motion
        </p>
      </div>
    </footer>
  );
}
