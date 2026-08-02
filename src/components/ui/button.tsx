import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-medium " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-[260ms] ease-[cubic-bezier(0.16,1,0.3,1)] " +
  "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-white shadow-[0_10px_34px_-12px_rgb(var(--brand-rgb)/0.85)] " +
    "hover:bg-brand-700 hover:shadow-[0_16px_44px_-10px_rgb(var(--brand-rgb)/0.95)]",
  outline:
    "border border-line-strong bg-transparent text-fg hover:border-brand hover:text-accent " +
    "hover:bg-[rgb(var(--brand-rgb)/0.06)]",
  ghost: "bg-transparent text-fg-muted hover:text-fg hover:bg-surface-2",
};

// Every size clears the 44px minimum touch target.
const sizes: Record<Size, string> = {
  sm: "h-11 px-5 text-sm",
  md: "h-12 px-6 text-[0.9375rem]",
  lg: "h-14 px-8 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

type ButtonLinkProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    /** Set for mailto:, tel: and cross-origin destinations. */
    external?: boolean;
  };

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  external,
  ...props
}: ButtonLinkProps) {
  const classes = cn(base, variants[variant], sizes[size], className);
  const isExternal =
    external ?? (/^https?:\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:"));

  if (isExternal) {
    const isProtocol = href.startsWith("mailto:") || href.startsWith("tel:");
    return (
      <a
        href={href}
        className={classes}
        {...(isProtocol ? {} : { target: "_blank", rel: "noopener noreferrer" })}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  );
}
