"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { navLinks, profile } from "@/lib/data";
import { useActiveSection } from "@/hooks/use-active-section";
import { EASE_EXPO } from "@/lib/motion";
import { ThemeToggle } from "./theme-toggle";
import { Magnetic } from "@/components/motion/magnetic";
import { cn } from "@/lib/utils";

const SECTION_IDS = navLinks.map((l) => l.id);

export function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const activeSection = useActiveSection(SECTION_IDS);

  const [condensed, setCondensed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setCondensed(v > 40));

  // Close the overlay on route change — including browser back/forward, which
  // no click handler would catch. Adjusting state during render (rather than
  // in an effect) avoids rendering one frame of a stale open menu.
  const [renderedPath, setRenderedPath] = useState(pathname);
  if (renderedPath !== pathname) {
    setRenderedPath(pathname);
    if (menuOpen) setMenuOpen(false);
  }

  // Lock the page behind the overlay while it is open.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // On a project page the hash links must route home first.
  const hrefFor = (hash: string) => (isHome ? hash : `/${hash}`);

  return (
    <>
      <ScrollProgress />

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          condensed ? "py-2.5" : "py-4",
        )}
      >
        <div className="shell">
          <nav
            aria-label="Primary"
            className={cn(
              "flex items-center justify-between gap-4 rounded-full pl-5 pr-2.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
              condensed ? "glass h-14 shadow-[0_8px_30px_-14px_rgb(0_0_0/0.4)]" : "h-16 border border-transparent",
            )}
          >
            <Link
              href="/"
              className="group flex items-center gap-2.5 text-sm font-semibold tracking-tight"
              aria-label={`${profile.fullName} — home`}
            >
              <span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-brand text-[0.6875rem] font-bold text-white">
                AH
              </span>
              <span className="hidden sm:inline">
                {profile.firstName}{" "}
                <span className="text-fg-muted transition-colors group-hover:text-accent">
                  {profile.lastName}
                </span>
              </span>
            </Link>

            {/* Desktop links */}
            <ul className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => {
                const active = isHome && activeSection === link.id;
                return (
                  <li key={link.id}>
                    <Link
                      href={hrefFor(link.href)}
                      aria-current={active ? "location" : undefined}
                      className={cn(
                        "relative inline-flex h-11 items-center rounded-full px-4 text-sm transition-colors duration-200",
                        active ? "text-fg" : "text-fg-muted hover:text-fg",
                      )}
                    >
                      {active ? (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-full bg-surface-2"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      ) : null}
                      <span className="relative z-10">{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-2">
              <ThemeToggle />

              <Magnetic strength={0.25} className="hidden sm:inline-flex">
                <Link
                  href={hrefFor("#contact")}
                  className="group inline-flex h-11 items-center gap-1.5 rounded-full bg-brand px-5 text-sm font-medium text-white transition-colors duration-[260ms] hover:bg-brand-700"
                >
                  Let&rsquo;s talk
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-[260ms] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Magnetic>

              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                aria-expanded={menuOpen}
                className="grid h-11 w-11 place-items-center rounded-full border border-line text-fg-muted transition-colors hover:border-brand hover:text-accent lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        hrefFor={hrefFor}
        activeSection={isHome ? activeSection : ""}
      />
    </>
  );
}

/* ------------------------------------------------------------------ mobile */

function MobileMenu({
  open,
  onClose,
  hrefFor,
  activeSection,
}: {
  open: boolean;
  onClose: () => void;
  hrefFor: (hash: string) => string;
  activeSection: string;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="menu"
          id="mobile-menu"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.6, ease: EASE_EXPO }}
          className="fixed inset-0 z-[70] bg-bg lg:hidden"
        >
          <div className="shell flex h-full flex-col">
            <div className="flex h-20 items-center justify-between">
              <span className="text-label text-fg-subtle">Menu</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="grid h-11 w-11 place-items-center rounded-full border border-line text-fg-muted transition-colors hover:border-brand hover:text-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav aria-label="Mobile" className="flex flex-1 flex-col justify-center">
              <ul className="flex flex-col gap-1">
                {navLinks.map((link, i) => {
                  const active = activeSection === link.id;
                  return (
                    <motion.li
                      key={link.id}
                      initial={{ opacity: 0, y: 26 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.14 + i * 0.06, duration: 0.6, ease: EASE_EXPO }}
                    >
                      <Link
                        href={hrefFor(link.href)}
                        onClick={onClose}
                        aria-current={active ? "location" : undefined}
                        className="group flex items-baseline gap-4 py-3"
                      >
                        <span
                          className={cn(
                            "text-label w-6",
                            active ? "text-accent" : "text-fg-subtle",
                          )}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={cn(
                            "text-display transition-colors duration-300 group-hover:text-accent",
                            active ? "text-accent" : undefined,
                          )}
                        >
                          {link.label}
                        </span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.42 }}
              className="flex flex-col gap-2 border-t border-line py-7"
            >
              <a href={`mailto:${profile.email}`} className="text-mono-sm text-fg-muted hover:text-accent">
                {profile.email}
              </a>
              <a href={`tel:${profile.phoneHref}`} className="text-mono-sm text-fg-muted hover:text-accent">
                {profile.phone}
              </a>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/* ---------------------------------------------------------------- progress */

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      aria-hidden
      style={{ scaleX: scrollYProgress }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-brand"
    />
  );
}
