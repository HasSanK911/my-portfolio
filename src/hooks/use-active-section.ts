"use client";

import { useEffect, useState } from "react";

/** Where the reading line sits, as a fraction of viewport height. */
const LINE = 0.35;

/**
 * Tracks which section the reader is currently in so the nav can reflect
 * position.
 *
 * Resolved against section offsets rather than `IntersectionObserver` ratios:
 * these sections run several viewports tall, so intersection ratios stay near
 * zero and comparing them mostly compares section heights. Instead a single
 * line a third of the way down the viewport claims the last section whose top
 * has crossed it — which also keeps the previous entry lit while an untracked
 * section (Credentials) passes, where a band-based observer would blank out.
 */
export function useActiveSection(ids: readonly string[]) {
  // Starts empty, not at the first id — above the first section nothing is
  // active, and highlighting "Work" while the user is still in the hero would
  // be a lie about where they are.
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;

      // Sorted by position, not by `ids` order: the nav lists Work before
      // About while the page renders them the other way round.
      const sections = ids
        .map((id) => {
          const el = document.getElementById(id);
          return el ? { id, top: el.getBoundingClientRect().top } : null;
        })
        .filter((s): s is { id: string; top: number } => s !== null)
        .sort((a, b) => a.top - b.top);

      if (sections.length === 0) return;

      // The last section is usually too short to push its own top past the
      // line, so it claims whatever is left once the page bottoms out.
      const atBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2;

      if (atBottom) {
        setActive(sections[sections.length - 1].id);
        return;
      }

      const line = window.innerHeight * LINE;
      let current = "";
      for (const section of sections) {
        if (section.top <= line) current = section.id;
      }
      setActive(current);
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ids]);

  return active;
}
