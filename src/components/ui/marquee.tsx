import { cn } from "@/lib/utils";

type MarqueeProps = {
  items: readonly string[];
  /** Seconds for one full loop. */
  duration?: number;
  reverse?: boolean;
  className?: string;
  itemClassName?: string;
  separator?: string;
};

/**
 * Infinite horizontal ticker. The list is duplicated once and translated by
 * -50%, so the loop is seamless. The clone is `aria-hidden` and the whole strip
 * is decorative — the same content is available as real text elsewhere.
 * CSS animation only: no JS ticks, and `prefers-reduced-motion` halts it.
 */
export function Marquee({
  items,
  duration = 34,
  reverse = false,
  className,
  itemClassName,
  separator = "◆",
}: MarqueeProps) {
  const row = (hidden: boolean) => (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-8 pr-8 md:gap-12 md:pr-12"
    >
      {items.map((item, i) => (
        <li key={`${item}-${i}`} className={cn("flex items-center gap-8 md:gap-12", itemClassName)}>
          <span>{item}</span>
          <span className="text-brand/70 text-[0.6em]" aria-hidden>
            {separator}
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className={cn("group relative flex w-full overflow-hidden", className)}
      style={
        {
          // Fade the strip into the page edges instead of cutting it off.
          maskImage:
            "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          "--marquee-duration": `${duration}s`,
        } as React.CSSProperties
      }
    >
      <div
        className={cn(
          "flex min-w-full shrink-0 items-center",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
        )}
      >
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
