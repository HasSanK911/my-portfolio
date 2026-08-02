"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type PlaceholderImageProps = {
  /**
   * Public path to the real asset, e.g. `/images/work/jobero-01.jpg`.
   * Leave undefined (or drop the file in and set it) — until then a styled
   * placeholder renders in its exact final footprint, so swapping the real
   * image in never shifts layout.
   */
  src?: string;
  alt: string;
  /** Shown inside the placeholder so you know which asset belongs here. */
  label?: string;
  /**
   * Path of the file to drop into /public. Only the filename is printed on
   * the placeholder — the folder is documented in public/images/README.md and
   * a full path just truncates inside narrow cards.
   */
  hint?: string;
  /** CSS aspect-ratio value, e.g. "16 / 10". Reserves space, prevents CLS. */
  ratio?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
  /** Rounds the corners of the frame. */
  rounded?: "sm" | "md" | "lg" | "xl" | "none";
};

const roundedMap = {
  none: "",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
} as const;

/**
 * Every image slot on the site goes through this component. With no `src` it
 * renders a designed placeholder; the moment a real path is supplied it swaps
 * to an optimised `next/image` occupying identical space.
 */
export function PlaceholderImage({
  src,
  alt,
  label,
  hint,
  ratio = "16 / 10",
  className,
  imageClassName,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw",
  rounded = "lg",
}: PlaceholderImageProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div
      className={cn(
        "relative isolate w-full overflow-hidden bg-surface-2",
        roundedMap[rounded],
        className,
      )}
      style={{ aspectRatio: ratio }}
    >
      {showImage ? (
        <Image
          src={src as string}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setFailed(true)}
          className={cn("object-cover", imageClassName)}
        />
      ) : (
        <div
          role="img"
          aria-label={`Placeholder for ${alt}`}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center"
        >
          {/* Diagonal hatch */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.35] dark:opacity-[0.22]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, transparent 0 9px, var(--border-strong) 9px 10px)",
            }}
          />
          {/* Crimson bloom */}
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-[65%] w-[65%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{ background: "var(--glow-a)" }}
          />
          {/* Corner ticks */}
          <span aria-hidden className="absolute left-3 top-3 h-4 w-4 border-l border-t border-line-strong" />
          <span aria-hidden className="absolute right-3 top-3 h-4 w-4 border-r border-t border-line-strong" />
          <span aria-hidden className="absolute bottom-3 left-3 h-4 w-4 border-b border-l border-line-strong" />
          <span aria-hidden className="absolute bottom-3 right-3 h-4 w-4 border-b border-r border-line-strong" />

          <div className="relative z-10 flex flex-col items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong bg-surface/70 backdrop-blur-sm">
              <ImageIcon className="h-4 w-4 text-fg-subtle" aria-hidden />
            </span>
            {label ? (
              <span className="text-label text-fg-muted">{label}</span>
            ) : null}
            {hint ? (
              <span className="text-mono-sm max-w-[90%] truncate text-fg-subtle">
                {hint.split("/").pop()}
              </span>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
