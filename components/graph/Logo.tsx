export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      role="img"
      aria-label="Wiki Graph Explorer logo"
    >
      <line
        x1="8"
        y1="16"
        x2="17"
        y2="7"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <circle cx="8" cy="16" r="6" fill="currentColor" />
      <circle cx="17" cy="7" r="3.5" fill="currentColor" />
    </svg>
  );
}
