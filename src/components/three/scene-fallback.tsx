/**
 * Pure-CSS stand-in for the WebGL scene. Rendered while the 3D bundle streams
 * in, and permanently when WebGL is unavailable or blocked — so the hero never
 * appears as an empty void.
 */
export function SceneFallback() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div
        className="ambient left-1/2 top-[38%] h-[46vmax] w-[46vmax] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "radial-gradient(circle, rgb(var(--brand-rgb) / 0.42), rgb(var(--brand-rgb) / 0.08) 45%, transparent 70%)",
        }}
      />
      <div
        className="ambient left-[18%] top-[62%] h-[26vmax] w-[26vmax]"
        style={{ background: "var(--glow-b)" }}
      />
      <div
        className="ambient right-[12%] top-[22%] h-[22vmax] w-[22vmax]"
        style={{ background: "var(--glow-b)" }}
      />
      {/* Concentric rings echo the orbit geometry of the real scene. */}
      <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2">
        {[36, 52, 70].map((size, i) => (
          <div
            key={size}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{
              width: `${size}vmin`,
              height: `${size}vmin`,
              borderColor: `rgb(var(--brand-rgb) / ${0.16 - i * 0.04})`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
