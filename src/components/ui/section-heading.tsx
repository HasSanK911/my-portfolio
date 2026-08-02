import type { ReactNode } from "react";
import { TextReveal } from "@/components/motion/text-reveal";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  /** Zero-padded index, e.g. "01" — rendered as a monospace eyebrow. */
  index?: string;
  eyebrow: string;
  title: string;
  /** Words within `title` rendered in the accent colour + italic. */
  accentWords?: string[];
  description?: string;
  align?: "left" | "center";
  className?: string;
  children?: ReactNode;
};

export function SectionHeading({
  index,
  eyebrow,
  title,
  accentWords,
  description,
  align = "left",
  className,
  children,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        centered ? "items-center text-center" : "items-start",
        className,
      )}
    >
      <Reveal direction="up" className="flex items-center gap-3">
        <span className="h-px w-8 bg-brand" aria-hidden />
        <span className="text-label text-accent">
          {index ? <span className="text-fg-subtle">{index} — </span> : null}
          {eyebrow}
        </span>
      </Reveal>

      <TextReveal
        as="h2"
        text={title}
        accentWords={accentWords}
        className={cn("text-title max-w-3xl", centered && "mx-auto")}
      />

      {description ? (
        <Reveal direction="up" delay={0.1}>
          <p className={cn("text-lead max-w-2xl", centered && "mx-auto")}>{description}</p>
        </Reveal>
      ) : null}

      {children}
    </div>
  );
}
