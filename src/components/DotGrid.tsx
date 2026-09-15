// Magic UI-style dot-grid backdrop for in-app screens only (not landing/login).
// Pure CSS, very low contrast — texture, not decoration. `fixed` so it always
// spans the full viewport regardless of scroll position or content height,
// instead of being bounded by its (content-sized) relative parent.
export function DotGrid() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
      style={{
        backgroundImage: "radial-gradient(hsl(var(--foreground) / 0.14) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
        maskImage: "radial-gradient(ellipse 70% 70% at 50% 0%, black 50%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 0%, black 50%, transparent 100%)",
      }}
    />
  );
}
