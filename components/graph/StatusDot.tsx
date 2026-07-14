// Deliberately not the dataviz skill's reserved status palette (good/warning/serious/critical —
// that set means health/severity). "active"/"revisiting"/"dormant" is a content-freshness state,
// a different concept, so it borrows only the "good" and "warning" hues for the two states that
// map cleanly (thriving, needs attention) and falls back to a neutral chrome gray for "dormant"
// (quiet, not alarming) and any unknown status.
const STATUS_COLORS: Record<string, string> = {
  active: "#0ca30c",
  revisiting: "#fab219",
};

const DORMANT_OR_UNKNOWN_COLOR = "#898781";

export function statusColor(status: string): string {
  return STATUS_COLORS[status] ?? DORMANT_OR_UNKNOWN_COLOR;
}

interface StatusDotProps {
  status: string;
  size?: number;
}

export function StatusDot({ status, size = 8 }: StatusDotProps) {
  return (
    <span
      role="img"
      aria-label={`status: ${status}`}
      title={status}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: statusColor(status),
      }}
    />
  );
}
