import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative z-10 flex min-h-svh flex-col items-center justify-center gap-8 bg-bg px-6 text-center">
      <div
        aria-hidden
        className="ambient left-1/2 top-1/2 h-[34vmax] w-[34vmax] -translate-x-1/2 -translate-y-1/2"
        style={{ background: "var(--glow-a)" }}
      />

      <p className="text-label relative text-accent">Error 404</p>

      <h1 className="text-hero relative !text-[clamp(3rem,14vw,9rem)]">
        Not <span className="text-brand-gradient italic">found</span>
      </h1>

      <p className="text-lead relative max-w-md">
        That page doesn&rsquo;t exist — it may have moved, or the link may be out of date.
      </p>

      <div className="relative flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="group inline-flex h-14 items-center gap-2 rounded-full bg-brand px-8 text-base font-medium text-white transition-colors duration-[260ms] hover:bg-brand-700"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-[260ms] group-hover:-translate-x-1" />
          Back home
        </Link>
        <Link
          href="/work"
          className="inline-flex h-14 items-center rounded-full border border-line-strong px-8 text-base font-medium transition-colors duration-[260ms] hover:border-brand hover:text-accent"
        >
          Browse work
        </Link>
      </div>
    </div>
  );
}
