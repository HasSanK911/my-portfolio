"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/use-browser-state";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  // The resolved theme is unknowable during SSR; render a stable, correctly
  // sized shell until hydration so the toggle never causes layout shift.
  const mounted = useMounted();

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} theme` : "Switch theme"}
      className={cn(
        "relative grid h-11 w-11 place-items-center rounded-full border border-line",
        "text-fg-muted transition-colors duration-[260ms] hover:border-brand hover:text-accent",
        className,
      )}
    >
      <AnimatePresence initial={false} mode="wait">
        {mounted ? (
          <motion.span
            key={isDark ? "moon" : "sun"}
            initial={{ opacity: 0, rotate: -70, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 70, scale: 0.6 }}
            transition={{ duration: 0.24 }}
            className="grid place-items-center"
          >
            {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </motion.span>
        ) : (
          <span className="h-4 w-4" />
        )}
      </AnimatePresence>
    </button>
  );
}
