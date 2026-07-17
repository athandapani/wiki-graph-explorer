import pkg from "../../package.json";

interface FooterProps {
  nodeCount?: number;
  edgeCount?: number;
  sourceCount?: number | null;
}

export function Footer({ nodeCount, edgeCount, sourceCount }: FooterProps = {}) {
  const hasStats = typeof nodeCount === "number" && typeof edgeCount === "number";
  const statsText = hasStats
    ? sourceCount
      ? `Built from ${sourceCount} raw sources → ${nodeCount} wiki pages and ${edgeCount} connections`
      : `${nodeCount} wiki pages · ${edgeCount} connections`
    : null;

  return (
    <footer className="border-t border-black/10 px-4 py-3 text-xs text-foreground/60 dark:border-white/10">
      {statsText ? <p>{statsText}</p> : null}
      {hasStats ? (
        <p>Esc to reset — clears search, closes menus, or deselects the current node.</p>
      ) : null}
      <p>wiki-graph-explorer v{pkg.version}</p>
    </footer>
  );
}
