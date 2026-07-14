import pkg from "../../package.json";

export function Footer() {
  return <footer>wiki-graph-explorer v{pkg.version}</footer>;
}
